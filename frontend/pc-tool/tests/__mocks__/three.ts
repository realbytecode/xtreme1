/**
 * Mock for Three.js library
 * Provides minimal mock implementations to avoid ES module import issues in Jest
 */

export class Vector2 {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v: Vector3) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    add(v: Vector3) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    sub(v: Vector3) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    multiplyScalar(s: number) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length > 0) {
            this.multiplyScalar(1 / length);
        }
        return this;
    }

    distanceTo(v: Vector3) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}

export class Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    set(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    clone() {
        return new Vector4(this.x, this.y, this.z, this.w);
    }
}

export class Object3D {
    userData: any = {};
    children: any[] = [];
    matrix: any;
    matrixWorld: any;
    position: any;
    rotation: any;
    quaternion: any;
    scale: any;

    constructor() {
        this.userData = {};
        this.children = [];
        this.matrix = {};
        this.matrixWorld = {};
        this.position = new Vector3();
        this.rotation = {};
        this.quaternion = {};
        this.scale = new Vector3(1, 1, 1);
    }

    updateMatrixWorld(force?: boolean) {
        // Mock implementation
    }

    add(object: Object3D) {
        this.children.push(object);
        return this;
    }

    remove(object: Object3D) {
        const index = this.children.indexOf(object);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
        return this;
    }
}

export class Box3 {
    min: Vector3;
    max: Vector3;

    constructor() {
        this.min = new Vector3();
        this.max = new Vector3();
    }

    setFromObject() {
        return this;
    }

    getSize() {
        return new Vector3();
    }

    getCenter() {
        return new Vector3();
    }
}

export class Sphere {
    center: Vector3;
    radius: number;

    constructor(center?: Vector3, radius?: number) {
        this.center = center || new Vector3();
        this.radius = radius !== undefined ? radius : 1;
    }

    set(center: Vector3, radius: number) {
        this.center.copy(center);
        this.radius = radius;
        return this;
    }
}

export class Scene extends Object3D {}

export class Camera extends Object3D {
    matrixWorldInverse: any;
    projectionMatrix: any;
    projectionMatrixInverse: any;

    constructor() {
        super();
        this.matrixWorldInverse = {};
        this.projectionMatrix = {};
        this.projectionMatrixInverse = {};
    }

    updateMatrixWorld(force?: boolean) {
        super.updateMatrixWorld?.(force);
    }
}

export class PerspectiveCamera extends Camera {
    fov: number;
    aspect: number;
    near: number;
    far: number;
    zoom = 1;

    constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    updateProjectionMatrix() {}
}

export class WebGLRenderer {
    domElement = document.createElement('canvas');

    setSize() {}
    render() {}
    dispose() {}
}

export class Raycaster {
    ray: any = { origin: new Vector3(), direction: new Vector3() };
    near = 0;
    far = Infinity;
    camera: any = null;
    layers: any = { mask: 1 };
    params: any = {};

    constructor(origin?: Vector3, direction?: Vector3, near?: number, far?: number) {
        if (origin) this.ray.origin = origin;
        if (direction) this.ray.direction = direction;
        if (near !== undefined) this.near = near;
        if (far !== undefined) this.far = far;
    }

    set(origin: Vector3, direction: Vector3) {
        this.ray.origin.set(origin.x, origin.y, origin.z);
        this.ray.direction.set(direction.x, direction.y, direction.z);
    }

    setFromCamera(coords: any, camera: any) {
        this.camera = camera;
    }

    intersectObject(object: any, recursive?: boolean) {
        return [];
    }

    intersectObjects(objects: any[], recursive?: boolean) {
        return [];
    }
}

export class Plane {
    normal: Vector3;
    constant: number;

    constructor(normal?: Vector3, constant?: number) {
        this.normal = normal || new Vector3(1, 0, 0);
        this.constant = constant || 0;
    }

    setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3) {
        this.normal = normal.clone();
        this.constant = -point.x * normal.x - point.y * normal.y - point.z * normal.z;
        return this;
    }

    distanceToPoint(point: Vector3) {
        return this.normal.x * point.x + this.normal.y * point.y + this.normal.z * point.z + this.constant;
    }
}

export class Line3 {
    start: Vector3;
    end: Vector3;

    constructor(start?: Vector3, end?: Vector3) {
        this.start = start || new Vector3();
        this.end = end || new Vector3();
    }

    set(start: Vector3, end: Vector3) {
        this.start.copy(start);
        this.end.copy(end);
        return this;
    }

    closestPointToPoint(point: Vector3, clampToLine: boolean, target: Vector3) {
        target.copy(this.start);
        return target;
    }
}

export class Frustum {
    planes: Plane[];

    constructor(p0?: Plane, p1?: Plane, p2?: Plane, p3?: Plane, p4?: Plane, p5?: Plane) {
        this.planes = [
            p0 || new Plane(),
            p1 || new Plane(),
            p2 || new Plane(),
            p3 || new Plane(),
            p4 || new Plane(),
            p5 || new Plane(),
        ];
    }

    setFromProjectionMatrix(m: Matrix4) {
        return this;
    }

    intersectsBox(box: Box3) {
        return true;
    }

    intersectsObject(object: Object3D) {
        return true;
    }
}

export class Matrix4 {
    elements: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    identity() {
        return this;
    }

    extractRotation(m: Matrix4) {
        return this;
    }

    makeRotationAxis(axis: Vector3, angle: number) {
        // Mock implementation - in real Three.js this would create a rotation matrix
        return this;
    }

    multiply(m: Matrix4) {
        return this;
    }

    multiplyMatrices(a: Matrix4, b: Matrix4) {
        return this;
    }

    setPosition(x: number | Vector3, y?: number, z?: number) {
        return this;
    }

    compose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
        return this;
    }

    decompose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
        return this;
    }

    copy(m: Matrix4) {
        return this;
    }

    clone() {
        return new Matrix4();
    }
}

export class Quaternion {
    x = 0;
    y = 0;
    z = 0;
    w = 1;

    setFromRotationMatrix(m: Matrix4) {
        return this;
    }

    setFromAxisAngle(axis: Vector3, angle: number) {
        return this;
    }
}

export class Euler {
    x: number;
    y: number;
    z: number;
    order: string;

    constructor(x = 0, y = 0, z = 0, order = 'XYZ') {
        this.x = x;
        this.y = y;
        this.z = z;
        this.order = order;
    }

    set(x: number, y: number, z: number, order?: string) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (order !== undefined) this.order = order;
        return this;
    }

    setFromQuaternion(q: Quaternion, order?: string) {
        if (order !== undefined) this.order = order;
        return this;
    }
}

// Geometry classes
export class BufferGeometry {
    attributes: any = {};
    index: any = null;
    boundingSphere: any = null;

    constructor() {}

    setAttribute(name: string, attribute: any) {
        this.attributes[name] = attribute;
        return this;
    }

    setIndex(index: any) {
        this.index = index;
        return this;
    }

    computeBoundingSphere() {
        // Mock implementation
    }
}

export class PlaneGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number) {
        super();
    }
}

export class BoxGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, depth?: number) {
        super();
    }
}

export class CylinderGeometry extends BufferGeometry {
    constructor(radiusTop?: number, radiusBottom?: number, height?: number, radialSegments?: number) {
        super();
    }
}

export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number) {
        super();
    }
}

export class OctahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number) {
        super();
    }
}

export class RingGeometry extends BufferGeometry {
    constructor(innerRadius?: number, outerRadius?: number, thetaSegments?: number, phiSegments?: number, thetaStart?: number, thetaLength?: number) {
        super();
    }
}

export class BufferAttribute {
    constructor(array: any, itemSize: number) {}
}

export class Float32BufferAttribute extends BufferAttribute {
    constructor(array: any, itemSize: number) {
        super(array, itemSize);
    }
}

export class Uint16BufferAttribute extends BufferAttribute {
    constructor(array: any, itemSize: number) {
        super(array, itemSize);
    }
}

export class Uint32BufferAttribute extends BufferAttribute {
    constructor(array: any, itemSize: number) {
        super(array, itemSize);
    }
}

// Material classes
export class Material {
    transparent = false;
    opacity = 1;
    depthTest = true;
    depthWrite = true;
    side = 0;
    constructor() {}
}

export class MeshBasicMaterial extends Material {
    color: any;
    constructor(parameters?: any) {
        super();
        if (parameters?.color !== undefined) this.color = parameters.color;
    }
}

export class LineBasicMaterial extends Material {
    constructor(parameters?: any) {
        super();
    }
}

export class LineDashedMaterial extends Material {
    constructor(parameters?: any) {
        super();
    }

    computeLineDistances() {
        return this;
    }
}

export class ShaderMaterial extends Material {
    uniforms: any = {};
    vertexShader = '';
    fragmentShader = '';

    constructor(parameters?: any) {
        super();
        if (parameters) {
            if (parameters.uniforms) this.uniforms = parameters.uniforms;
            if (parameters.vertexShader) this.vertexShader = parameters.vertexShader;
            if (parameters.fragmentShader) this.fragmentShader = parameters.fragmentShader;
        }
    }
}

export class RawShaderMaterial extends ShaderMaterial {
    constructor(parameters?: any) {
        super(parameters);
    }
}

// Mesh and Line classes
export class Mesh extends Object3D {
    geometry: any;
    material: any;
    constructor(geometry?: any, material?: any) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

export class Line extends Object3D {
    geometry: any;
    material: any;
    constructor(geometry?: any, material?: any) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

export class LineSegments extends Object3D {
    geometry: any;
    material: any;
    constructor(geometry?: any, material?: any) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

export class Points extends Object3D {
    geometry: any;
    material: any;
    constructor(geometry?: any, material?: any) {
        super();
        this.geometry = geometry;
        this.material = material;
    }
}

export class Group extends Object3D {}

// Color class
export class Color {
    r = 1;
    g = 1;
    b = 1;
    constructor(r?: number | string, g?: number, b?: number) {
        if (typeof r === 'number') {
            this.r = r;
            if (g !== undefined) this.g = g;
            if (b !== undefined) this.b = b;
        }
    }
    setHex(hex: number) {
        return this;
    }
}

// Mock Lut (Lookup Table for color mapping)
export class Lut {
    minV = 0;
    maxV = 1;
    constructor(colormap?: string, numberOfColors?: number) {}
    setMin(min: number) {
        this.minV = min;
        return this;
    }
    setMax(max: number) {
        this.maxV = max;
        return this;
    }
    getColor(value: number) {
        return new Color(1, 1, 1);
    }
}

// Event Dispatcher
export class EventDispatcher {
    private listeners: Record<string, Array<(event: any) => void>> = {};

    addEventListener(type: string, listener: (event: any) => void) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        if (this.listeners[type].indexOf(listener) === -1) {
            this.listeners[type].push(listener);
        }
    }

    hasEventListener(type: string, listener: (event: any) => void) {
        return this.listeners[type] !== undefined && this.listeners[type].indexOf(listener) !== -1;
    }

    removeEventListener(type: string, listener: (event: any) => void) {
        const listenerArray = this.listeners[type];
        if (listenerArray !== undefined) {
            const index = listenerArray.indexOf(listener);
            if (index !== -1) {
                listenerArray.splice(index, 1);
            }
        }
    }

    dispatchEvent(event: { type: string; [key: string]: any }) {
        const listenerArray = this.listeners[event.type];
        if (listenerArray !== undefined) {
            const array = listenerArray.slice(0);
            for (let i = 0; i < array.length; i++) {
                array[i].call(this, event);
            }
        }
    }
}

// Mock OrbitControls
export class OrbitControls {
    constructor(camera: any, domElement: any) {}
    update() {}
    dispose() {}
}

// Cache object for file loading
export const Cache = {
    enabled: false,
    files: {} as Record<string, any>,
    add: function (key: string, file: any) {
        this.files[key] = file;
    },
    get: function (key: string) {
        return this.files[key];
    },
    remove: function (key: string) {
        delete this.files[key];
    },
    clear: function () {
        this.files = {};
    },
};

// Loader base class
export class Loader {
    manager: any;
    crossOrigin = 'anonymous';
    withCredentials = false;
    path = '';
    resourcePath = '';
    requestHeader: Record<string, string> = {};

    constructor(manager?: any) {
        this.manager = manager || {};
    }

    load(url: string, onLoad?: (data: any) => void, onProgress?: (event: ProgressEvent) => void, onError?: (error: Error) => void) {
        // Mock implementation
    }

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<any> {
        return Promise.resolve({});
    }

    parse(data: any) {
        return {};
    }

    setCrossOrigin(crossOrigin: string) {
        this.crossOrigin = crossOrigin;
        return this;
    }

    setPath(path: string) {
        this.path = path;
        return this;
    }

    setResourcePath(resourcePath: string) {
        this.resourcePath = resourcePath;
        return this;
    }

    setRequestHeader(requestHeader: Record<string, string>) {
        this.requestHeader = requestHeader;
        return this;
    }
}

// Three.js constants
export const FrontSide = 0;
export const BackSide = 1;
export const DoubleSide = 2;
export const NoBlending = 0;
export const NormalBlending = 1;
export const AdditiveBlending = 2;
export const SubtractiveBlending = 3;
export const MultiplyBlending = 4;
export const CustomBlending = 5;

export default {
    Vector2,
    Vector3,
    Vector4,
    Object3D,
    Box3,
    Sphere,
    Scene,
    Camera,
    PerspectiveCamera,
    WebGLRenderer,
    Raycaster,
    Plane,
    Line3,
    Frustum,
    Matrix4,
    Quaternion,
    Euler,
    BufferGeometry,
    PlaneGeometry,
    BoxGeometry,
    CylinderGeometry,
    SphereGeometry,
    OctahedronGeometry,
    RingGeometry,
    BufferAttribute,
    Float32BufferAttribute,
    Uint16BufferAttribute,
    Uint32BufferAttribute,
    Material,
    MeshBasicMaterial,
    LineBasicMaterial,
    LineDashedMaterial,
    ShaderMaterial,
    RawShaderMaterial,
    Mesh,
    Line,
    LineSegments,
    Points,
    Group,
    Color,
    Lut,
    EventDispatcher,
    OrbitControls,
    Loader,
    Cache,
    // Constants
    FrontSide,
    BackSide,
    DoubleSide,
    NoBlending,
    NormalBlending,
    AdditiveBlending,
    SubtractiveBlending,
    MultiplyBlending,
    CustomBlending,
};
