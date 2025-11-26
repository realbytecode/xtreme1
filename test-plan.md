# Track Merge Functionality - Comprehensive Test Plan

## Test Categories

### 1. Class Name Validation Tests

#### Test 1.1: Reject merge with different className
```typescript
test('should reject merge when tracks have different className', () => {
  const track1 = createTrack('track-1', { className: 'Car', classId: 1, classType: '3D_BOX' });
  const track2 = createTrack('track-2', { className: 'Pedestrian', classId: 2, classType: '3D_BOX' });

  const result = trackManager.canMerge('track-1', 'track-2');

  expect(result.code).toBe('classType_diff');
  expect(trackManager.mergeTrackObject).not.toHaveBeenCalled();
});
```

#### Test 1.2: Reject merge with different classId (even if className same)
```typescript
test('should reject merge when classId differs', () => {
  const track1 = createTrack('track-1', { className: 'Car', classId: 1 });
  const track2 = createTrack('track-2', { className: 'Car', classId: 2 }); // Different ID!

  const result = trackManager.canMerge('track-1', 'track-2');

  expect(result.code).toBe('classType_diff');
});
```

#### Test 1.3: Reject merge with different classType (tool type)
```typescript
test('should reject merge when classType differs', () => {
  const track1 = createTrack('track-1', { className: 'Car', classType: '3D_BOX' });
  const track2 = createTrack('track-2', { className: 'Car', classType: 'POLYGON' });

  const result = trackManager.canMerge('track-1', 'track-2');

  expect(result.code).toBe('classType_diff');
});
```

#### Test 1.4: Check predicted class (modelClass) if present
```typescript
test('should validate modelClass for model predictions', () => {
  const track1 = createTrack('track-1', {
    className: 'Adult',
    classId: 1,
    modelClass: 'adult',  // Predicted class
  });
  const track2 = createTrack('track-2', {
    className: 'Adult',
    classId: 1,
    modelClass: 'child',  // Different prediction!
  });

  const result = trackManager.canMerge('track-1', 'track-2');

  expect(result.code).toBe('classType_diff');
});
```

#### Test 1.5: Allow merge with same ground truth and predicted class
```typescript
test('should allow merge when all class attributes match', () => {
  const track1 = createTrack('track-1', {
    className: 'Adult',
    classId: 1,
    classType: '3D_BOX',
    modelClass: 'adult',
  });
  const track2 = createTrack('track-2', {
    className: 'Adult',
    classId: 1,
    classType: '3D_BOX',
    modelClass: 'adult',
  });

  const result = trackManager.canMerge('track-1', 'track-2');

  expect(result.code).toBe('ok');
});
```

---

### 2. Tracks with Gaps in Frames

#### Test 2.1: Merge tracks with gaps updates all instances
```typescript
test('should update all track instances even with gaps', () => {
  // Track 1 appears in frames: [0, 2, 5, 10]
  const frames = createFrames(15);
  const track1Objects = [
    createObject('track-1', frames[0]),
    createObject('track-1', frames[2]),
    createObject('track-1', frames[5]),
    createObject('track-1', frames[10]),
  ];

  // Track 2 appears in frames: [1, 3, 8]
  const track2Objects = [
    createObject('track-2', frames[1]),
    createObject('track-2', frames[3]),
    createObject('track-2', frames[8]),
  ];

  trackManager.mergeTrackObject('track-1', 'track-2');

  // All track-1 objects should now have track-2's ID and name
  track1Objects.forEach(obj => {
    expect(obj.userData.trackId).toBe('track-2');
    expect(obj.userData.trackName).toBe(track2Objects[0].userData.trackName);
  });

  // Track-2 objects unchanged
  track2Objects.forEach(obj => {
    expect(obj.userData.trackId).toBe('track-2');
  });
});
```

#### Test 2.2: Gaps remain gaps after merge
```typescript
test('should preserve gaps in merged track', () => {
  const frames = createFrames(10);

  // Track 1: frames [0, 5, 9]
  createObject('track-1', frames[0]);
  createObject('track-1', frames[5]);
  createObject('track-1', frames[9]);

  // Track 2: frames [2, 7]
  createObject('track-2', frames[2]);
  createObject('track-2', frames[7]);

  trackManager.mergeTrackObject('track-1', 'track-2');

  // Verify track-2 now has objects in: [0, 2, 5, 7, 9]
  const track2Objects = trackManager.getObjects('track-2', frames);
  const frameIndices = track2Objects.map(obj => obj.frame.index).sort();

  expect(frameIndices).toEqual([0, 2, 5, 7, 9]);

  // Gaps at [1, 3, 4, 6, 8] should still be empty
  expect(trackManager.getObjects('track-2', [frames[1]])).toHaveLength(0);
  expect(trackManager.getObjects('track-2', [frames[3]])).toHaveLength(0);
  expect(trackManager.getObjects('track-2', [frames[4]])).toHaveLength(0);
});
```

#### Test 2.3: Merge works with only one object in track
```typescript
test('should merge track with single object', () => {
  const frames = createFrames(10);

  // Track 1: only frame 5
  const singleObject = createObject('track-1', frames[5]);

  // Track 2: frames [0, 2, 7]
  createObject('track-2', frames[0]);
  createObject('track-2', frames[2]);
  createObject('track-2', frames[7]);

  trackManager.mergeTrackObject('track-1', 'track-2');

  expect(singleObject.userData.trackId).toBe('track-2');

  // Track-2 should now have 4 objects
  const track2Objects = trackManager.getObjects('track-2', frames);
  expect(track2Objects).toHaveLength(4);
});
```

---

### 3. Undo/Redo Behavior Tests

#### Test 3.1: Undo restores exact previous state
```typescript
test('should restore exact state before merge on undo', () => {
  const frames = createFrames(5);

  // Initial state
  const track1Obj = createObject('track-1', frames[0], {
    trackName: 'track_10',
    className: 'Car',
    contour: { center3D: { x: 10, y: 20, z: 1.5 } }
  });

  const track2Obj = createObject('track-2', frames[1], {
    trackName: 'track_5',
    className: 'Car',
    contour: { center3D: { x: 15, y: 25, z: 1.8 } }
  });

  // Capture initial state
  const initialState = {
    track1: {
      trackId: track1Obj.userData.trackId,
      trackName: track1Obj.userData.trackName,
      contour: { ...track1Obj.contour },
    },
    track2: {
      trackId: track2Obj.userData.trackId,
      trackName: track2Obj.userData.trackName,
      contour: { ...track2Obj.contour },
    },
  };

  // Perform merge
  trackManager.mergeTrackObject('track-1', 'track-2');

  // Verify merge happened
  expect(track1Obj.userData.trackId).toBe('track-2');
  expect(track1Obj.userData.trackName).toBe('track_5');

  // Undo merge
  editor.cmdManager.undo();

  // Verify EXACT restoration
  expect(track1Obj.userData.trackId).toBe(initialState.track1.trackId);
  expect(track1Obj.userData.trackName).toBe(initialState.track1.trackName);
  expect(track1Obj.contour).toEqual(initialState.track1.contour);

  expect(track2Obj.userData.trackId).toBe(initialState.track2.trackId);
  expect(track2Obj.userData.trackName).toBe(initialState.track2.trackName);
  expect(track2Obj.contour).toEqual(initialState.track2.contour);

  // Both tracks should exist again as separate entities
  expect(trackManager.trackMap.has('track-1')).toBe(true);
  expect(trackManager.trackMap.has('track-2')).toBe(true);
});
```

#### Test 3.2: Undo does NOT give second track name to both tracks
```typescript
test('should not give both tracks same name after undo', () => {
  const track1 = createTrack('track-1', { trackName: 'track_10' });
  const track2 = createTrack('track-2', { trackName: 'track_5' });

  // Merge track_10 into track_5
  trackManager.mergeTrackObject('track-1', 'track-2');

  // After merge: both should be track_5
  expect(getTrackName('track-1')).toBeUndefined(); // track-1 deleted
  expect(getTrackName('track-2')).toBe('track_5');

  // Undo
  editor.cmdManager.undo();

  // After undo: should restore original names
  expect(getTrackName('track-1')).toBe('track_10');  // NOT 'track_5'!
  expect(getTrackName('track-2')).toBe('track_5');   // Unchanged
});
```

#### Test 3.3: Redo after undo works correctly
```typescript
test('should redo merge correctly after undo', () => {
  const frames = createFrames(3);
  const track1Obj = createObject('track-1', frames[0]);
  const track2Obj = createObject('track-2', frames[1]);

  // Initial state
  const original = {
    track1Id: track1Obj.userData.trackId,
    track1Name: track1Obj.userData.trackName,
  };

  // Merge
  trackManager.mergeTrackObject('track-1', 'track-2');
  expect(track1Obj.userData.trackId).toBe('track-2');

  // Undo
  editor.cmdManager.undo();
  expect(track1Obj.userData.trackId).toBe(original.track1Id);
  expect(track1Obj.userData.trackName).toBe(original.track1Name);

  // Redo
  editor.cmdManager.redo();
  expect(track1Obj.userData.trackId).toBe('track-2');
  expect(track1Obj.userData.trackName).toBe(track2Obj.userData.trackName);
});
```

#### Test 3.4: Multiple undo/redo cycles maintain consistency
```typescript
test('should handle multiple undo/redo cycles', () => {
  const track1 = createTrack('track-1', { trackName: 'A' });
  const track2 = createTrack('track-2', { trackName: 'B' });

  // Merge
  trackManager.mergeTrackObject('track-1', 'track-2');

  // Undo → Redo → Undo → Redo
  editor.cmdManager.undo();
  expect(getTrackName('track-1')).toBe('A');

  editor.cmdManager.redo();
  expect(getTrackName('track-1')).toBeUndefined(); // Merged into track-2

  editor.cmdManager.undo();
  expect(getTrackName('track-1')).toBe('A');

  editor.cmdManager.redo();
  expect(getTrackName('track-1')).toBeUndefined();
});
```

---

### 4. Edge Cases

#### Test 4.1: Reject merge with overlapping frames
```typescript
test('should reject merge when tracks have objects in same frame', () => {
  const frame = createFrame(0);

  createObject('track-1', frame);
  createObject('track-2', frame); // Both in frame 0!

  const result = trackManager.canMerge('track-1', 'track-2');

  expect(result.code).toBe('object_repeat');
  expect(result.data).toContain(0); // Frame index 0 has conflict
});
```

#### Test 4.2: Reject merge with empty track
```typescript
test('should reject merge when one track is empty', () => {
  createTrack('track-1'); // Empty track
  createTrack('track-2', { trackName: 'B' });

  const result = trackManager.canMerge('track-1', 'track-2');

  expect(result.code).toBe('classType_diff'); // No objects to compare
});
```

#### Test 4.3: Merge updates classValues/attributes
```typescript
test('should preserve attributes during merge', () => {
  const obj1 = createObject('track-1', createFrame(0), {
    classValues: [{ attributeId: 1, value: 'red' }]
  });

  const obj2 = createObject('track-2', createFrame(1), {
    classValues: [{ attributeId: 1, value: 'blue' }]
  });

  trackManager.mergeTrackObject('track-1', 'track-2');

  // Track ID/name updated, but attributes preserved
  expect(obj1.userData.trackId).toBe('track-2');
  expect(obj1.userData.classValues).toEqual([{ attributeId: 1, value: 'red' }]);
  expect(obj2.userData.classValues).toEqual([{ attributeId: 1, value: 'blue' }]);
});
```

---

### 5. Integration Tests (UI Flow)

#### Test 5.1: Full merge flow from UI button
```typescript
test('merge button triggers full workflow', async () => {
  // Mount component
  const wrapper = mount(MergeButton);

  // Click merge button
  await wrapper.find('[data-testid="merge-btn"]').trigger('click');

  // Verify validation called
  expect(trackManager.canMerge).toHaveBeenCalled();

  // Verify confirmation dialog
  expect(editor.showConfirm).toHaveBeenCalledWith(
    expect.objectContaining({
      title: expect.stringContaining('Merge'),
    })
  );

  // Verify merge executed
  expect(trackManager.mergeTrackObject).toHaveBeenCalled();

  // Verify success message
  expect(editor.showMsg).toHaveBeenCalledWith('success', expect.any(String));
});
```

#### Test 5.2: Error handling for invalid merge
```typescript
test('should show error when merge validation fails', async () => {
  // Mock validation to fail
  trackManager.canMerge.mockReturnValue({ code: 'classType_diff' });

  const wrapper = mount(MergeButton);
  await wrapper.find('[data-testid="merge-btn"]').trigger('click');

  // Should NOT show confirmation
  expect(editor.showConfirm).not.toHaveBeenCalled();

  // Should show error message
  expect(editor.showMsg).toHaveBeenCalledWith(
    'error',
    expect.stringContaining('class')
  );

  // Should NOT execute merge
  expect(trackManager.mergeTrackObject).not.toHaveBeenCalled();
});
```

---

## Test Execution Plan

### Unit Tests (Fast, ~100ms total)
- Run all TrackManager method tests
- Run all validation tests
- Run CmdGroup undo/redo tests

### Integration Tests (Medium, ~500ms total)
- Run UI component tests
- Run event flow tests

### Manual Testing (5 minutes)
- Visual verification of merge UI
- Confirmation dialog appearance
- Success/error message styling
- Timeline update visualization

## Coverage Goals
- TrackManager.canMerge: 100%
- TrackManager.mergeTrackObject: 100%
- CmdGroup undo/redo: 100%
- UI components: 80%+
- Overall: 90%+
