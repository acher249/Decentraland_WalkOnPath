// Create path curve

export function humanWalk( ) {

    // how many points on the curve
    const curvePoints = 25

    // Define the points through which the path must pass
    const cpoint1 = new Vector3(6.4, 0, 4.2)
    const cpoint2 = new Vector3(12.8, 0, 3.2)
    const cpoint3 = new Vector3(12.8, 0, 12.8)
    const cpoint4 = new Vector3(3.2, 0, 11.2)

    const cpoint5 = new Vector3(1.2, 0, 11.2)
    const cpoint6 = new Vector3(3, 0, 10)
    const cpoint7 = new Vector3(13, 0, 6)
    const cpoint8 = new Vector3(4.2, 0, 4.6)

    // Compile these points into an array
    const cpoints_1 = [cpoint1, cpoint2, cpoint3, cpoint4]

    const cpoints_2 = [cpoint5, cpoint6, cpoint7, cpoint8]

    // Create a Catmull-Rom Spline curve. This curve passes through all 4 points. The total number of points in the path is set by  `curvePoints`
    const catmullPath_1 = Curve3.CreateCatmullRomSpline(
    cpoints_1,
    curvePoints,
    true
    ).getPoints()

    const catmullPath_2 = Curve3.CreateCatmullRomSpline(
    cpoints_2,
    curvePoints,
    true
    ).getPoints()

    // Custom component to store path and lerp data
    @Component('pathData_1')
    class PathData_1 {
    origin: number = 0
    target: number = 1
    path: Vector3[] = catmullPath_1
    fraction: number = 0
    constructor(path: Vector3[]) {
        this.path = path
    }
    }

    @Component('pathData_2')
    class PathData_2 {
    origin: number = 0
    target: number = 1
    path: Vector3[] = catmullPath_2
    fraction: number = 0
    constructor(path: Vector3[]) {
        this.path = path
    }
    }

    // component group of all sharks (just one in this example, but could be extended)
    const humans_1 = engine.getComponentGroup(PathData_1)
    const humans_2 = engine.getComponentGroup(PathData_2)

    // Custom component to store rotational lerp data
    @Component('rotateData')
    class RotateData {
    originRot: Quaternion = Quaternion.Identity
    targetRot: Quaternion = Quaternion.Identity
    fraction: number = 0
    }

    // Custom component to store current speed
    @Component('walkSpeed')
    class WalkSpeed {
    speed: number = 2
    }

    // Lerp over the points of the curve
    class PatrolPath_1 {
    update() {
        for (const human of humans_1.entities) {
        const transform = human.getComponent(Transform)
        const path = human.getComponent(PathData_1)
        const speed = human.getComponent(WalkSpeed)
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

    class PatrolPath_2 {
    update() {
        for (const human of humans_2.entities) {
        const transform = human.getComponent(Transform)
        const path = human.getComponent(PathData_2)
        const speed = human.getComponent(WalkSpeed)
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

    engine.addSystem(new PatrolPath_1(), 2)
    engine.addSystem(new PatrolPath_2(), 2)

    // Change speed depending on how steep the current section of the shark's path is
    class UpdateSpeed {
    update() {
        for (const shark of humans_1.entities) {
        const speed = shark.getComponent(WalkSpeed)
        speed.speed = 2

        }
    }
    }

    engine.addSystem(new UpdateSpeed(), 1)

    // Rotate gradually with a spherical lerp
    class RotateSystem_1 {
    update(dt: number) {
        for (const human of humans_1.entities) {
        const transform = human.getComponent(Transform)
        const path = human.getComponent(PathData_1)
        const rotate = human.getComponent(RotateData)
        const speed = human.getComponent(WalkSpeed)
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

    class RotateSystem_2 {
    update(dt: number) {
        for (const human of humans_2.entities) {
        const transform = human.getComponent(Transform)
        const path = human.getComponent(PathData_2)
        const rotate = human.getComponent(RotateData)
        const speed = human.getComponent(WalkSpeed)
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

    engine.addSystem(new RotateSystem_1(), 3)
    engine.addSystem(new RotateSystem_2(), 3)

    // Add HumanWalking Model model
    const humanWalking_1 = new Entity()
    humanWalking_1.addComponent(
    new Transform({
        position: new Vector3(1, 0, 1),
        scale: new Vector3(1.2, 1.2, 1.2)
    })
    )

    humanWalking_1.addComponent(new GLTFShape('models/WalkingMan_LowPoly3.gltf'))
    humanWalking_1.addComponent(new PathData_1(catmullPath_1))
    humanWalking_1.addComponent(new RotateData())
    humanWalking_1.addComponent(new WalkSpeed())
    engine.addEntity(humanWalking_1)


    const humanWalking_2 = new Entity()
    humanWalking_2.addComponent(
    new Transform({
        position: new Vector3(1, 0, 1),
        scale: new Vector3(1.2, 1.2, 1.2)
    })
    )

    humanWalking_2.addComponent(new GLTFShape('models/WalkingMan_LowPoly3.gltf'))
    humanWalking_2.addComponent(new PathData_2(catmullPath_2))
    humanWalking_2.addComponent(new RotateData())
    humanWalking_2.addComponent(new WalkSpeed())
    engine.addEntity(humanWalking_2)

}

