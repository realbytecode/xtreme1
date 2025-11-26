/**
 * Mock Editor for Testing
 * Provides a minimal mock of the Editor instance with TrackManager, CmdManager, etc.
 */

export interface MockEditorOptions {
  state?: any;
  trackManager?: any;
  cmdManager?: any;
  dataManager?: any;
  [key: string]: any;
}

export function createMockEditor(overrides: MockEditorOptions = {}) {
  const mockEditor = {
    state: {
      frameIndex: 0,
      frames: [],
      config: { autoLoad: false },
      classTypes: [],
      annotations: [],
      isSeriesFrame: true,
      ...overrides.state,
    },
    trackManager: {
      trackMap: new Map(),
      trackInfo: new Map(),
      getTrackObject: jest.fn((trackId: string) => ({
        trackId,
        trackName: `Track_${trackId}`,
      })),
      getTrackObjectMap: jest.fn((trackIds: string[]) => {
        const map: any = {};
        trackIds.forEach((id) => {
          map[id] = [];
        });
        return map;
      }),
      canMerge: jest.fn().mockReturnValue({ code: 'ok', data: [] }),
      mergeTrackObject: jest.fn(),
      deleteObjectByTrack: jest.fn(),
      getObjects: jest.fn().mockReturnValue([]),
      setDataByTrackId: jest.fn(),
      ...overrides.trackManager,
    },
    cmdManager: {
      cmds: [],
      cmdIndex: -1,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      execute: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      withGroup: jest.fn((fn) => fn()),
      ...overrides.cmdManager,
    },
    dataManager: {
      getFrameObject: jest.fn().mockReturnValue([]),
      copyForward: jest.fn(),
      copyBackWard: jest.fn(),
      dataMap: new Map(),
      ...overrides.dataManager,
    },
    playManager: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      play: jest.fn(),
      stop: jest.fn(),
      playing: false,
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    showConfirm: jest.fn().mockResolvedValue(true),
    showMsg: jest.fn(),
    loadFrame: jest.fn(),
    lang: jest.fn((key) => key),
    selectByTrackId: jest.fn(),
    pc: {
      selectObject: jest.fn(),
      selection: [],
      render: jest.fn(),
    },
    dataResource: {
      setLoadMode: jest.fn(),
      load: jest.fn(),
    },
    ...overrides,
  };

  return mockEditor;
}

export function createMockFrame(index: number, id?: string) {
  return {
    id: id || `frame-${index}`,
    index,
    name: `Frame ${index}`,
    url: '',
    loadState: 'LOADED',
  };
}

export function createMockFrames(count: number) {
  return Array.from({ length: count }, (_, i) => createMockFrame(i));
}

export function createMockObject(trackId: string, frame: any, userData: any = {}) {
  return {
    id: `obj-${trackId}-${frame.index}`,
    objectType: '3D_BOX',
    frame,
    userData: {
      trackId,
      trackName: `Track_${trackId}`,
      classId: 1,
      className: 'Car',
      classType: '3D_BOX',
      classValues: [],
      ...userData,
    },
    contour: {
      center3D: { x: 0, y: 0, z: 0 },
      rotation3D: { x: 0, y: 0, z: 0 },
      size3D: { x: 1, y: 1, z: 1 },
    },
  };
}

export function createMockTrack(trackId: string, userData: any = {}, frames: any[] = []) {
  return {
    trackId,
    trackName: userData.trackName || `Track_${trackId}`,
    objects: frames.map((frame) => createMockObject(trackId, frame, userData)),
  };
}
