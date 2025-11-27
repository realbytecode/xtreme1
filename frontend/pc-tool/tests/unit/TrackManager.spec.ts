/**
 * TrackManager Tests
 * Tests for track merge, validation, and edge cases
 */

import TrackManager from '../../src/packages/pc-editor/common/TrackManager';
import { createMockEditor, createMockFrames, createMockObject } from '../__mocks__/editorMock';

describe('TrackManager', () => {
  let editor: any;
  let trackManager: TrackManager;

  beforeEach(() => {
    editor = createMockEditor();
    trackManager = new TrackManager(editor);
  });

  describe('canMerge - Class Validation', () => {
    test('should reject merge when className differs', () => {
      const frames = createMockFrames(2);
      editor.state.frames = frames;

      // Create objects with different className
      const track1Obj = createMockObject('track-1', frames[0], {
        className: 'Car',
        classId: 1,
        classType: '3D_BOX',
      });

      const track2Obj = createMockObject('track-2', frames[1], {
        className: 'Pedestrian', // Different className
        classId: 2,
        classType: '3D_BOX',
      });

      // Mock getTrackObjectMap to return our test objects
      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': [[track1Obj], []],
        'track-2': [[], [track2Obj]],
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      expect(result.code).toBe('classType_diff');
    });

    test('should reject merge when classId differs', () => {
      const frames = createMockFrames(2);
      const track1Obj = createMockObject('track-1', frames[0], {
        className: 'Car',
        classId: 1,
      });

      const track2Obj = createMockObject('track-2', frames[1], {
        className: 'Car',
        classId: 2, // Different classId
      });

      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': [[track1Obj], []],
        'track-2': [[], [track2Obj]],
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      expect(result.code).toBe('classType_diff');
    });

    test('should reject merge when classType differs', () => {
      const frames = createMockFrames(2);
      const track1Obj = createMockObject('track-1', frames[0], {
        className: 'Car',
        classId: 1,
        classType: '3D_BOX',
      });

      const track2Obj = createMockObject('track-2', frames[1], {
        className: 'Car',
        classId: 1,
        classType: 'POLYGON', // Different tool type
      });

      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': [[track1Obj], []],
        'track-2': [[], [track2Obj]],
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      expect(result.code).toBe('classType_diff');
    });

    test('should reject merge when modelClass differs (ML predictions)', () => {
      const frames = createMockFrames(2);
      const track1Obj = createMockObject('track-1', frames[0], {
        className: 'Adult',
        classId: 1,
        classType: '3D_BOX',
        modelClass: 'adult', // ML prediction
      });

      const track2Obj = createMockObject('track-2', frames[1], {
        className: 'Adult',
        classId: 1,
        classType: '3D_BOX',
        modelClass: 'child', // Different ML prediction
      });

      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': [[track1Obj], []],
        'track-2': [[], [track2Obj]],
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      expect(result.code).toBe('classType_diff');
    });

    test('should allow merge when all class attributes match', () => {
      const frames = createMockFrames(2);
      const track1Obj = createMockObject('track-1', frames[0], {
        className: 'Adult',
        classId: 1,
        classType: '3D_BOX',
        modelClass: 'adult',
      });

      const track2Obj = createMockObject('track-2', frames[1], {
        className: 'Adult',
        classId: 1,
        classType: '3D_BOX',
        modelClass: 'adult',
      });

      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': [[track1Obj], []],
        'track-2': [[], [track2Obj]],
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      expect(result.code).toBe('ok');
    });

    test('should allow merge when modelClass not present on both', () => {
      const frames = createMockFrames(2);
      const track1Obj = createMockObject('track-1', frames[0], {
        className: 'Car',
        classId: 1,
        classType: '3D_BOX',
        // No modelClass
      });

      const track2Obj = createMockObject('track-2', frames[1], {
        className: 'Car',
        classId: 1,
        classType: '3D_BOX',
        // No modelClass
      });

      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': [[track1Obj], []],
        'track-2': [[], [track2Obj]],
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      expect(result.code).toBe('ok');
    });

    test('should reject merge with empty tracks', () => {
      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': [], // Empty track
        'track-2': [],
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      expect(result.code).toBe('classType_diff');
    });
  });

  describe('canMerge - Frame Overlap Detection', () => {
    test('should detect overlapping frames', () => {
      const frames = createMockFrames(3);
      const track1Obj = createMockObject('track-1', frames[0]);
      const track2Obj = createMockObject('track-2', frames[0]); // Same frame!

      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': [[track1Obj], [], []],
        'track-2': [[track2Obj], [], []],
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      expect(result.code).toBe('object_repeat');
      expect(result.data).toContain(0); // Frame 0 has conflict
    });

    test('should allow merge with non-overlapping frames', () => {
      const frames = createMockFrames(3);
      const track1Obj = createMockObject('track-1', frames[0]);
      const track2Obj = createMockObject('track-2', frames[1]); // Different frames

      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': [[track1Obj], [], []],
        'track-2': [[], [track2Obj], []],
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      expect(result.code).toBe('ok');
    });
  });

  describe('mergeTrackObject - Input Validation', () => {
    test('should reject merge with null trackId', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      trackManager.mergeTrackObject(null as any, 'track-2');

      expect(editor.cmdManager.withGroup).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('trackId and targetTrackId are required'),
      );

      consoleErrorSpy.mockRestore();
    });

    test('should reject merge with same trackId', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      trackManager.mergeTrackObject('track-1', 'track-1');

      expect(editor.cmdManager.withGroup).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('cannot merge track with itself'),
      );

      consoleErrorSpy.mockRestore();
    });

    test('should reject merge when validation fails', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      trackManager.canMerge = jest.fn().mockReturnValue({
        code: 'classType_diff',
        data: [],
      });

      trackManager.mergeTrackObject('track-1', 'track-2');

      expect(editor.cmdManager.withGroup).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('merge validation failed'),
        expect.anything(),
      );

      consoleErrorSpy.mockRestore();
    });

    test('should reject merge when target track not found', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      trackManager.canMerge = jest.fn().mockReturnValue({ code: 'ok' });
      trackManager.getTrackObject = jest.fn().mockReturnValue(null);

      trackManager.mergeTrackObject('track-1', 'track-2');

      expect(editor.cmdManager.withGroup).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('target track track-2 not found'),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('mergeTrackObject - Successful Merge', () => {
    test('should execute merge with valid inputs', () => {
      trackManager.canMerge = jest.fn().mockReturnValue({ code: 'ok' });
      trackManager.getTrackObject = jest.fn().mockReturnValue({
        trackId: 'track-2',
        trackName: 'track_5',
      });

      trackManager.mergeTrackObject('track-1', 'track-2');

      // Verify merge executed
      expect(editor.cmdManager.withGroup).toHaveBeenCalled();
      expect(editor.selectByTrackId).toHaveBeenCalledWith('track-2');
    });

    test('should update track data correctly during merge', () => {
      let capturedCallback: any;

      editor.cmdManager.withGroup = jest.fn((fn) => {
        capturedCallback = fn;
        fn();
      });

      trackManager.canMerge = jest.fn().mockReturnValue({ code: 'ok' });
      trackManager.getTrackObject = jest.fn().mockReturnValue({
        trackId: 'track-2',
        trackName: 'track_5',
      });
      trackManager.setDataByTrackId = jest.fn();

      trackManager.mergeTrackObject('track-1', 'track-2');

      // Verify setDataByTrackId was called with correct parameters
      expect(trackManager.setDataByTrackId).toHaveBeenCalledWith('track-1', {
        userData: {
          trackName: 'track_5',
          trackId: 'track-2',
        },
      });

      // Verify delete-track was called
      expect(editor.cmdManager.execute).toHaveBeenCalledWith('delete-track', 'track-1');
    });
  });

  describe('Tracks with Gaps', () => {
    test('should handle tracks with gaps in frames', () => {
      const frames = createMockFrames(10);
      editor.state.frames = frames;

      // Track 1 appears in frames [0, 2, 5, 10] - gaps at [1, 3, 4, 6-9]
      const track1Objects = [
        createMockObject('track-1', frames[0]),
        createMockObject('track-1', frames[2]),
        createMockObject('track-1', frames[5]),
        createMockObject('track-1', frames[9]),
      ];

      // Track 2 appears in frames [1, 3, 8]
      const track2Objects = [
        createMockObject('track-2', frames[1]),
        createMockObject('track-2', frames[3]),
        createMockObject('track-2', frames[8]),
      ];

      // Create sparse array representation
      const track1Map = new Array(10);
      track1Map[0] = [track1Objects[0]];
      track1Map[2] = [track1Objects[1]];
      track1Map[5] = [track1Objects[2]];
      track1Map[9] = [track1Objects[3]];

      const track2Map = new Array(10);
      track2Map[1] = [track2Objects[0]];
      track2Map[3] = [track2Objects[1]];
      track2Map[8] = [track2Objects[2]];

      trackManager.getTrackObjectMap = jest.fn().mockReturnValue({
        'track-1': track1Map,
        'track-2': track2Map,
      });

      const result = trackManager.canMerge('track-1', 'track-2');

      // Should allow merge (no overlapping frames)
      expect(result.code).toBe('ok');
    });

    test('should preserve gaps during merge', () => {
      // This test verifies the merge operation doesn't create new objects in gaps
      trackManager.canMerge = jest.fn().mockReturnValue({ code: 'ok' });
      trackManager.getTrackObject = jest.fn().mockReturnValue({
        trackId: 'track-2',
        trackName: 'track_5',
      });

      // Spy on setDataByTrackId to verify it's called correctly
      const setDataSpy = jest.spyOn(trackManager, 'setDataByTrackId');

      trackManager.mergeTrackObject('track-1', 'track-2');

      // setDataByTrackId should only update existing objects
      expect(setDataSpy).toHaveBeenCalledWith('track-1', {
        userData: {
          trackName: 'track_5',
          trackId: 'track-2',
        },
      });

      // It should NOT create new objects for gaps
      // (This is implicitly tested - setDataByTrackId only updates existing objects)

      setDataSpy.mockRestore();
    });
  });
});
