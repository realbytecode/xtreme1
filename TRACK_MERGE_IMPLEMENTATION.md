# Track Merge Functionality Implementation

## Overview

This implementation adds track merging capabilities to the Xtreme1 3D annotation tool, allowing users to correct tracking mistakes where the same object gets assigned different track IDs.

## Changes Made

### 1. Bug Fixes

#### 1.1 CmdGroup Undo/Redo Order Bug (CRITICAL)
**File:** `frontend/pc-tool/src/packages/pc-editor/common/CmdManager/CmdGroup.ts`

**Problem:** Commands were being undone in forward order instead of reverse order, causing data corruption during undo operations.

**Fix:**
```typescript
// Before (WRONG):
undo() {
    this.cmds.forEach((e) => e.undo()); // Forward order
}

// After (CORRECT):
undo() {
    for (let i = this.cmds.length - 1; i >= 0; i--) {
        this.cmds[i].undo(); // Reverse order
    }
}
```

**Impact:** This fix ensures that when merging tracks, undo properly restores the original state without corruption.

#### 1.2 TrackManager Class Validation Bug (CRITICAL)
**File:** `frontend/pc-tool/src/packages/pc-editor/common/TrackManager.ts:266-293`

**Problem:** Only validated `classType`, not `className`, `classId`, or `modelClass`. Also returned `true` for empty tracks.

**Fix:**
- Now checks `className` (ground truth class name)
- Now checks `classId` (ground truth class ID)
- Now checks `classType` (tool type: 3D_BOX, POLYGON, etc.)
- Now checks `modelClass` (ML model prediction class)
- Rejects merge if tracks are empty

**Impact:** Prevents merging tracks with different classes, including ML prediction mismatches.

#### 1.3 Merge Validation and Null Checks
**File:** `frontend/pc-tool/src/packages/pc-editor/common/TrackManager.ts:305-347`

**Added validations:**
- Check if trackId and targetTrackId are provided
- Check if merging track with itself
- Validate canMerge before executing
- Check if target track exists
- Added descriptive error logging

### 2. New UI Component

#### 2.1 TrackMerge Component
**File:** `frontend/pc-tool/src/components/EditClass/TrackMerge.vue`

**Features:**
- Shows current track ID and name
- "Merge Track" button to initiate merge
- Interactive workflow: click button → click target track → confirm
- Validation with user-friendly error messages
- Success/error notifications

**User Workflow:**
1. Select object with wrong track (e.g., track_10)
2. Press 'T' key or click edit icon to open properties panel
3. Expand "Track Operations" section
4. Click "Merge Track" button
5. Click on object with correct track (e.g., track_5)
6. Confirm merge in dialog
7. All objects from track_10 are now part of track_5 across all frames

#### 2.2 Language Strings
**File:** `frontend/pc-tool/src/components/EditClass/lang/en.ts`

Added translations for:
- Track operations panel
- Merge button and tooltip
- Error messages (class mismatch, frame overlap, etc.)
- Confirmation dialogs
- Success/error notifications

### 3. Integration with EditClass Panel
**File:** `frontend/pc-tool/src/components/EditClass/index.vue`

- Added TrackMerge component as new collapse panel
- Shows only when single track is selected (not batch mode)
- Positioned after attributes panel

### 4. Comprehensive Test Suite

#### 4.1 Test Infrastructure
**File:** `frontend/main/tests/__mocks__/editorMock.ts`

Created mock helpers for testing:
- `createMockEditor()` - Mock editor instance
- `createMockFrame()` - Mock frame object
- `createMockObject()` - Mock 3D object
- `createMockTrack()` - Mock track with objects

#### 4.2 CmdGroup Tests
**File:** `frontend/main/tests/unit/CmdGroup.spec.ts`

**Tests (10 total):**
- Undo executes in reverse order
- Redo executes in forward order
- Undo/redo cycles work correctly
- Empty command groups handled
- Error handling during undo/redo
- Merge operation undo/redo scenarios
- Track name preservation after undo

#### 4.3 TrackManager Tests
**File:** `frontend/main/tests/unit/TrackManager.spec.ts`

**Tests (20+ total):**

**Class Validation:**
- Reject merge with different className
- Reject merge with different classId
- Reject merge with different classType
- Reject merge with different modelClass (ML predictions)
- Allow merge when all attributes match
- Reject empty tracks

**Frame Overlap:**
- Detect overlapping frames
- Allow non-overlapping merges

**Input Validation:**
- Reject null trackId
- Reject merging track with itself
- Reject when validation fails
- Reject when target track not found

**Successful Merge:**
- Execute merge with valid inputs
- Update track data correctly
- Call commands in correct order

**Tracks with Gaps:**
- Handle tracks with missing frames
- Preserve gaps during merge
- Update all instances across frames

## Test Cases Covered

### User-Requested Test Cases

✅ **Different Class Name Validation**
- Ground truth class name (className)
- Ground truth class ID (classId)
- Tool type (classType)
- ML prediction class (modelClass)

✅ **Tracks with Gaps**
- Track appears in frames [0, 2, 5, 10] with gaps
- Merge updates all 4 instances
- Gaps remain gaps (no new objects created)

✅ **Undo/Redo Behavior**
- Undo restores exact previous state
- Both tracks keep separate names after undo
- No corruption or same-name bug
- Multiple undo/redo cycles work correctly

## How to Use

### For End Users

1. **Open Dataset:** Load your point cloud sequence with tracks
2. **Select Wrong Track:** Click on object with incorrect track assignment
3. **Open Properties:** Press `T` key or click edit icon
4. **Merge Track:**
   - Expand "Track Operations" section
   - Click "Merge Track" button
   - Click on object with correct track
   - Confirm merge
5. **Verify:** Check timeline to confirm all frames updated

### For Developers

#### Running Tests

```bash
cd /home/user/xtreme1/frontend/main
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage report
```

#### Local Development

```bash
# Start backend services
cd /home/user/xtreme1
docker compose up mysql redis minio backend -d

# Start frontend dev server
cd frontend/pc-tool
npm run dev  # Access at http://localhost:3200
```

#### Testing in Browser

```javascript
// Open browser console and test TrackManager directly
const trackManager = editor.trackManager;

// Check if merge is valid
const result = trackManager.canMerge('track-1', 'track-2');
console.log(result); // { code: 'ok' } or error

// Execute merge
trackManager.mergeTrackObject('track-1', 'track-2');
```

## Technical Details

### Merge Operation Flow

1. **Validation:**
   - Check trackIds are valid
   - Check not merging with self
   - Check class compatibility (className, classId, classType, modelClass)
   - Check for frame overlaps

2. **Execution (Grouped Command):**
   ```
   withGroup(() => {
       setDataByTrackId(track1, { trackId: track2, trackName: track2Name })
       execute('delete-track', track1)
   })
   ```

3. **Undo (Reverse Order):**
   ```
   delete-track.undo()  // Recreate track-1 first
   setDataByTrackId.undo()  // Then restore its data
   ```

### Data Flow

```
User clicks "Merge Track" button
    ↓
User clicks target track object
    ↓
Validation (canMerge)
    ↓
Confirmation dialog
    ↓
TrackManager.mergeTrackObject()
    ↓
setDataByTrackId() - Update all objects with track1 ID to track2 ID
    ↓
delete-track command - Remove track1 from trackMap
    ↓
selectByTrackId(track2) - Select merged track
    ↓
Success notification
```

### Edge Cases Handled

✅ Empty tracks
✅ Tracks with single object
✅ Tracks with gaps in frames
✅ Overlapping frames (rejected)
✅ Different classes (rejected)
✅ Different ML predictions (rejected)
✅ Null/undefined parameters
✅ Merging track with itself
✅ Non-existent target track
✅ Undo/redo after merge
✅ Multiple merge operations
✅ Error conditions

## Files Changed

### Core Functionality
- `frontend/pc-tool/src/packages/pc-editor/common/CmdManager/CmdGroup.ts` - Fixed undo order
- `frontend/pc-tool/src/packages/pc-editor/common/TrackManager.ts` - Fixed validation & added checks

### UI Components
- `frontend/pc-tool/src/components/EditClass/TrackMerge.vue` - New merge component
- `frontend/pc-tool/src/components/EditClass/index.vue` - Integrated merge component
- `frontend/pc-tool/src/components/EditClass/lang/en.ts` - Added language strings

### Tests
- `frontend/main/tests/__mocks__/editorMock.ts` - Test utilities
- `frontend/main/tests/unit/CmdGroup.spec.ts` - CmdGroup tests
- `frontend/main/tests/unit/TrackManager.spec.ts` - TrackManager tests

### Documentation
- `test-plan.md` - Comprehensive test plan (30+ test cases)
- `TRACK_MERGE_IMPLEMENTATION.md` - This document

## Known Limitations

1. **No Split Functionality:** Only merge is implemented. Split remains disabled (was incomplete in original code).

2. **Manual Refresh:** After merge, timeline may need manual refresh to update visual representation.

3. **No Undo UI Indicator:** Undo/redo keyboard shortcuts work, but no visual indicator in UI.

4. **Single Track Selection:** Can only merge one track at a time, not batch operations.

## Future Enhancements

1. Add keyboard shortcut for merge (e.g., `Ctrl+M`)
2. Show merge preview before confirmation
3. Add merge history/audit log
4. Batch merge multiple tracks
5. Auto-detect and suggest merge candidates
6. Visual diff showing what will change

## Testing Checklist

Before deploying, verify:

- [ ] Unit tests pass (30+ tests)
- [ ] Undo/redo works correctly
- [ ] Different class names rejected
- [ ] Different modelClass rejected
- [ ] Tracks with gaps work
- [ ] Overlapping frames detected
- [ ] Empty tracks handled
- [ ] UI buttons appear and function
- [ ] Error messages display correctly
- [ ] Success notifications show
- [ ] Timeline updates after merge
- [ ] Can undo merge operation
- [ ] Can merge multiple times in succession

## Support

For issues or questions:
1. Check the test plan: `test-plan.md`
2. Review implementation: `TRACK_MERGE_IMPLEMENTATION.md`
3. Run tests: `npm test`
4. Check browser console for error logs
