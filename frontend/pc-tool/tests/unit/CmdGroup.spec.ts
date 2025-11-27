/**
 * CmdGroup Tests
 * Tests for command grouping and undo/redo order
 */

import CmdGroup from '../../src/packages/pc-editor/common/CmdManager/CmdGroup';
import CmdBase from '../../src/packages/pc-editor/common/CmdManager/CmdBase';
import { createMockEditor } from '../__mocks__/editorMock';

describe('CmdGroup', () => {
  let editor: any;
  let cmdGroup: CmdGroup;

  beforeEach(() => {
    editor = createMockEditor();
    cmdGroup = new CmdGroup(editor);
  });

  describe('undo/redo order', () => {
    test('should undo commands in REVERSE order', () => {
      const executionOrder: string[] = [];

      // Create mock commands that track execution order
      const cmd1 = {
        undo: jest.fn(() => executionOrder.push('cmd1-undo')),
        redo: jest.fn(() => executionOrder.push('cmd1-redo')),
      } as any;

      const cmd2 = {
        undo: jest.fn(() => executionOrder.push('cmd2-undo')),
        redo: jest.fn(() => executionOrder.push('cmd2-redo')),
      } as any;

      const cmd3 = {
        undo: jest.fn(() => executionOrder.push('cmd3-undo')),
        redo: jest.fn(() => executionOrder.push('cmd3-redo')),
      } as any;

      // Add commands in order: [cmd1, cmd2, cmd3]
      cmdGroup.cmds = [cmd1, cmd2, cmd3];

      // Execute undo
      cmdGroup.undo();

      // Verify undo executed in REVERSE order: cmd3, cmd2, cmd1
      expect(executionOrder).toEqual(['cmd3-undo', 'cmd2-undo', 'cmd1-undo']);
      expect(cmd1.undo).toHaveBeenCalledTimes(1);
      expect(cmd2.undo).toHaveBeenCalledTimes(1);
      expect(cmd3.undo).toHaveBeenCalledTimes(1);
    });

    test('should redo commands in FORWARD order', () => {
      const executionOrder: string[] = [];

      const cmd1 = {
        undo: jest.fn(),
        redo: jest.fn(() => executionOrder.push('cmd1-redo')),
      } as any;

      const cmd2 = {
        undo: jest.fn(),
        redo: jest.fn(() => executionOrder.push('cmd2-redo')),
      } as any;

      const cmd3 = {
        undo: jest.fn(),
        redo: jest.fn(() => executionOrder.push('cmd3-redo')),
      } as any;

      cmdGroup.cmds = [cmd1, cmd2, cmd3];

      // Execute redo
      cmdGroup.redo();

      // Verify redo executed in FORWARD order: cmd1, cmd2, cmd3
      expect(executionOrder).toEqual(['cmd1-redo', 'cmd2-redo', 'cmd3-redo']);
    });

    test('should handle undo/redo cycle correctly', () => {
      const executionOrder: string[] = [];

      const cmd1 = {
        undo: jest.fn(() => executionOrder.push('cmd1-undo')),
        redo: jest.fn(() => executionOrder.push('cmd1-redo')),
      } as any;

      const cmd2 = {
        undo: jest.fn(() => executionOrder.push('cmd2-undo')),
        redo: jest.fn(() => executionOrder.push('cmd2-redo')),
      } as any;

      cmdGroup.cmds = [cmd1, cmd2];

      // Undo
      cmdGroup.undo();
      expect(executionOrder).toEqual(['cmd2-undo', 'cmd1-undo']);

      // Redo
      executionOrder.length = 0;
      cmdGroup.redo();
      expect(executionOrder).toEqual(['cmd1-redo', 'cmd2-redo']);
    });

    test('should handle empty command group', () => {
      cmdGroup.cmds = [];

      // Should not throw error
      expect(() => cmdGroup.undo()).not.toThrow();
      expect(() => cmdGroup.redo()).not.toThrow();
    });

    test('should catch and log errors during undo', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const errorCmd = {
        undo: jest.fn(() => {
          throw new Error('Undo failed');
        }),
        redo: jest.fn(),
      } as any;

      cmdGroup.cmds = [errorCmd];

      // Should not throw, but should log error
      expect(() => cmdGroup.undo()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    test('should catch and log errors during redo', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const errorCmd = {
        undo: jest.fn(),
        redo: jest.fn(() => {
          throw new Error('Redo failed');
        }),
      } as any;

      cmdGroup.cmds = [errorCmd];

      // Should not throw, but should log error
      expect(() => cmdGroup.redo()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('merge track scenario', () => {
    test('should properly undo merge operation (UpdateData then DeleteTrack)', () => {
      const executionOrder: string[] = [];

      // Simulate merge operation commands
      const updateDataCmd = {
        undo: jest.fn(() => {
          executionOrder.push('restore-old-track-data');
          // This would restore track_10 to its original trackId and trackName
        }),
        redo: jest.fn(() => executionOrder.push('update-track-data')),
      } as any;

      const deleteTrackCmd = {
        undo: jest.fn(() => {
          executionOrder.push('recreate-deleted-track');
          // This would recreate the track_10 entry
        }),
        redo: jest.fn(() => executionOrder.push('delete-track')),
      } as any;

      // Commands added in execution order: [UpdateData, DeleteTrack]
      cmdGroup.cmds = [updateDataCmd, deleteTrackCmd];

      // Undo should execute in reverse: DeleteTrack.undo() first, then UpdateData.undo()
      cmdGroup.undo();

      expect(executionOrder).toEqual([
        'recreate-deleted-track', // DeleteTrack.undo() - recreate track first
        'restore-old-track-data', // UpdateData.undo() - then restore data
      ]);

      // This ensures track exists before we try to update its data
    });

    test('should not allow both tracks to have same name after undo', () => {
      // This is a conceptual test - the actual state is managed by the commands
      // The correct undo order prevents this issue

      const trackState: Record<string, { trackId: string; trackName: string } | undefined> = {
        'track-1': { trackId: 'track-1', trackName: 'track_10' },
        'track-2': { trackId: 'track-2', trackName: 'track_5' },
      };

      const updateDataCmd = {
        undo: jest.fn(() => {
          // Restore original track-1 data
          trackState['track-1'] = { trackId: 'track-1', trackName: 'track_10' };
        }),
        redo: jest.fn(),
      } as any;

      const deleteTrackCmd = {
        undo: jest.fn(() => {
          // Recreate track-1
          if (!trackState['track-1']) {
            trackState['track-1'] = { trackId: 'track-1', trackName: 'track_10' };
          }
        }),
        redo: jest.fn(),
      } as any;

      cmdGroup.cmds = [updateDataCmd, deleteTrackCmd];

      // After merge, track-1 is gone
      delete trackState['track-1'];

      // Undo merge
      cmdGroup.undo();

      // Verify both tracks exist with correct names
      expect(trackState['track-1']).toEqual({ trackId: 'track-1', trackName: 'track_10' });
      expect(trackState['track-2']).toEqual({ trackId: 'track-2', trackName: 'track_5' });
    });
  });
});
