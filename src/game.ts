// Create path curve

// how many points on the curve
const curvePoints = 25

// Define the points through which the path must pass
const cpoint1 = new Vector3(6.4, 0, 4.2)
const cpoint2 = new Vector3(12.8, 0, 3.2)
const cpoint3 = new Vector3(12.8, 0, 12.8)
const cpoint4 = new Vector3(3.2, 0, 11.2)

// Compile these points into an array
const cpoints_1 = [cpoint1, cpoint2, cpoint3, cpoint4]

// Create a Catmull-Rom Spline curve. This curve passes through all 4 points. The total number of points in the path is set by  `curvePoints`
const catmullPath_1 = Curve3.CreateCatmullRomSpline(
  cpoints_1,
  curvePoints,
  true
).getPoints()

// Custom component to store path and lerp data
@Component('pathData')
export class PathData {
  origin: number = 0
  target: number = 1
  path: Vector3[] = catmullPath_1
  fraction: number = 0
  constructor(path: Vector3[]) {
    this.path = path
  }
}

// component group of all sharks (just one in this example, but could be extended)
export const sharks = engine.getComponentGroup(PathData)

// Custom component to store rotational lerp data
@Component('rotateData')
export class RotateData {
  originRot: Quaternion = Quaternion.Identity
  targetRot: Quaternion = Quaternion.Identity
  fraction: number = 0
}

// Custom component to store current speed
@Component('swimSpeed')
export class SwimSpeed {
  speed: number = 0.5
}

// Lerp over the points of the curve
export class PatrolPath {
  update() {
    for (const shark of sharks.entities) {
      const transform = shark.getComponent(Transform)
      const path = shark.getComponent(PathData)
      const speed = shark.getComponent(SwimSpeed)
      transform.position = Vector3.Lerp(
        path.path[path.origin],
        path.path[path.target],
        path.fraction
      )
      path.fraction += speed.speed / 10
      if (path.fraction > 1) {
        path.origin = path.target
        path.target += 1
        if (path.target >= path.path.length - 1) {
          path.target = 0
        }
        path.fraction = 0
      }
    }
  }
}

engine.addSystem(new PatrolPath(), 2)

// Change speed depending on how steep the current section of the shark's path is
export class UpdateSpeed {
  update() {
    for (const shark of sharks.entities) {
      const speed = shark.getComponent(SwimSpeed)
      speed.speed = 1.9

    }
  }
}

engine.addSystem(new UpdateSpeed(), 1)

// Rotate gradually with a spherical lerp
export class RotateSystem {
  update(dt: number) {
    for (const shark of sharks.entities) {
      const transform = shark.getComponent(Transform)
      const path = shark.getComponent(PathData)
      const rotate = shark.getComponent(RotateData)
      const speed = shark.getComponent(SwimSpeed)
      rotate.fraction += speed.speed / 10

      if (rotate.fraction > 1) {
        rotate.fraction = 0
        rotate.originRot = transform.rotation
        const direction = path.path[path.target]
          .subtract(path.path[path.origin])
          .normalize()
        rotate.targetRot = Quaternion.LookRotation(direction)
      }
      transform.rotation = Quaternion.Slerp(
        rotate.originRot,
        rotate.targetRot,
        rotate.fraction
      )
    }
  }
}

engine.addSystem(new RotateSystem(), 3)

// Add HumanWalking Model model
const humanWalking_1 = new Entity()
humanWalking_1.addComponent(
  new Transform({
    position: new Vector3(1, 0, 1),
    scale: new Vector3(1.2, 1.2, 1.2)
  })
)

humanWalking_1.addComponent(new GLTFShape('models/WalkingMan_LowPoly3.gltf'))
humanWalking_1.addComponent(new PathData(catmullPath_1))
humanWalking_1.addComponent(new RotateData())
humanWalking_1.addComponent(new SwimSpeed())
engine.addEntity(humanWalking_1)


