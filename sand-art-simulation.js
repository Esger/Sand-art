function createMatterWorld() {
    // Initialize Matter.js modules
    const Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Events = Matter.Events,
        Composite = Matter.Composite;
    
    // Create engine and world
    const engine = Engine.create();
    const world = engine.world;
    
    // Create renderer
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframes: false,
            background: '#87CEEB' // Light blue background for water
        }
    });
    
    // Disable gravity (we'll implement custom forces)
    engine.world.gravity.y = 0;
    
    // Create walls
    const wallOptions = { isStatic: true, render: { fillStyle: '#FFFFFF' } };
    World.add(world, [
        Bodies.rectangle(400, 0, 800, 50, wallOptions),    // Top
        Bodies.rectangle(400, 600, 800, 50, wallOptions),  // Bottom
        Bodies.rectangle(0, 300, 50, 600, wallOptions),    // Left
        Bodies.rectangle(800, 300, 50, 600, wallOptions)   // Right
    ]);
    
    // Function to create sand particles
    function createSandParticle(x, y, color) {
        return Bodies.circle(x, y, 2, {
            restitution: 0.3,
            friction: 0.1,
            render: { fillStyle: color }
        });
    }
    
    // Function to create air bubbles
    function createAirBubble(x, y) {
        return Bodies.circle(x, y, 5, {
            restitution: 0.7,
            friction: 0.1,
            density: 0.001,
            render: { fillStyle: 'rgba(255, 255, 255, 0.7)' }
        });
    }
    
    // Add initial sand particles
    for (let i = 0; i < 1000; i++) {
        const color = Math.random() > 0.5 ? '#FFD700' : '#8B4513'; // Gold or Brown
        World.add(world, createSandParticle(Math.random() * 800, Math.random() * 600, color));
    }
    
    // Add initial air bubbles
    for (let i = 0; i < 50; i++) {
        World.add(world, createAirBubble(Math.random() * 800, Math.random() * 600));
    }
    
    // Custom force application
    Events.on(engine, 'beforeUpdate', function() {
        const bodies = Composite.allBodies(engine.world);
    
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            
            if (!body.isStatic) {
                // Simulate fluid resistance
                Body.applyForce(body, body.position, {
                    x: -body.velocity.x * 0.01,
                    y: -body.velocity.y * 0.01
                });
    
                // Gravity for sand particles
                if (body.render.fillStyle !== 'rgba(255, 255, 255, 0.7)') {
                    Body.applyForce(body, body.position, {
                        x: 0,
                        y: 0.0003 // Adjust this value to change fall speed
                    });
                }
                // Buoyancy for air bubbles
                else {
                    Body.applyForce(body, body.position, {
                        x: 0,
                        y: -0.0001 // Adjust this value to change rise speed
                    });
                }
            }
        }
    });
    
    // Run the engine and renderer
    Matter.Runner.run(engine)
    // Engine.run(engine);
    Render.run(render);
    
    // Add mouse control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
    World.add(world, mouseConstraint);
    render.mouse = mouse;
    
    // Function to tilt the container
    function tiltContainer(angle) {
        World.clear(world, false);
        Engine.clear(engine);
        
        const newGravity = Matter.Vector.rotate({ x: 0, y: 0.0003 }, angle);
        engine.world.gravity = newGravity;
        
        // Recreate walls with new angle
        const wallOptions = { isStatic: true, render: { fillStyle: '#FFFFFF' } };
        World.add(world, [
            Bodies.rectangle(400, 0, 800, 50, { ...wallOptions, angle: angle }),
            Bodies.rectangle(400, 600, 800, 50, { ...wallOptions, angle: angle }),
            Bodies.rectangle(0, 300, 50, 600, { ...wallOptions, angle: angle }),
            Bodies.rectangle(800, 300, 50, 600, { ...wallOptions, angle: angle })
        ]);
        
        // Recreate particles and bubbles
        for (let i = 0; i < 1000; i++) {
            const color = Math.random() > 0.5 ? '#FFD700' : '#8B4513';
            World.add(world, createSandParticle(Math.random() * 800, Math.random() * 600, color));
        }
        for (let i = 0; i < 50; i++) {
            World.add(world, createAirBubble(Math.random() * 800, Math.random() * 600));
        }
    }
    
    // Example: Tilt the container by 15 degrees
    // tiltContainer(Math.PI / 12);
};

document.addEventListener('DOMContentLoaded', function() {
    createMatterWorld();
});
