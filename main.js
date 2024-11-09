import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

scene.background = new THREE.Color(0X1F282D);// remove this

const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enabled = true;
controls.minDistance = 0;
controls.maxDistance = 1000;

function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}

function rotationMatrixX(theta) {
    return new THREE.Matrix4().set(
        1, 0, 0, 0,
        0, Math.cos(theta), -Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

function rotationMatrixY(theta) {
    return new THREE.Matrix4().set(
        Math.cos(theta), 0, Math.sin(theta), 0,
        0, 1, 0, 0,
        -Math.sin(theta), 0, Math.cos(theta), 0,
        0, 0, 0, 1
    );
}

function rotationMatrixZ(theta) {
	return new THREE.Matrix4().set(
		Math.cos(theta), -Math.sin(theta), 0, 0,
		Math.sin(theta),  Math.cos(theta), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	);
}

let planets = [];
let clock = new THREE.Clock();
let attachedObject = null;
let blendingFactor = 0.1;
// Create additional variables as needed here

// Starter code sphere, feel free to delete it afterwards
// let geometry = new THREE.SphereGeometry(1, 32, 32);
// let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
// let sphere = new THREE.Mesh(geometry, material);
// scene.add(sphere);
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('/Users/jasondai/Downloads/solar_systems/sun.jpg'); // Replace with the path to your texture image
// TODO: Create the sun
let sun = null;

const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color to start

sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);


// TODO: Create sun light
let sunLight = null;
sunLight = new THREE.PointLight(0xffffff, 1, 0, 1); // Infinite range (distance = 0) with decay = 1
sunLight.position.set(0, 0, 0); // Center it with the sun
scene.add(sunLight);

// Create orbiting planets
// TODO: Create Planet 1: Flat-shaded Gray Planet
let mercury = null;
const mercuryGeometry = new THREE.SphereGeometry(1, 8, 6); // Radius 1, with lower segment counts for flat look
const mercuryMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, flatShading: true }); // Gray color with flat shading
mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
scene.add(mercury);

// TODO: Create Planet 2: Swampy Green-Blue with Dynamic Shading
let venus = null;
const venusGeometry = new THREE.SphereGeometry(1, 8, 8);
const phongMaterialProperties = {
		map:sunTexture,
    color: new THREE.Color(0x80FFFF), // Swampy green-blue color
    ambient: .5,                     // No ambient component
    diffusivity: 0.5,                 // Low diffuse component
    specularity: 1.0,                 // Maximum specular component
    smoothness: 40.0                  // Moderate shininess
};
const venusMaterial = createPhongMaterial(phongMaterialProperties);
venus = new THREE.Mesh(venusGeometry, venusMaterial);
scene.add(venus);

// TODO: Create Planet 3: Muddy Brown-Orange Planet with Ring
let saturn = null;
const saturnGeometry = new THREE.SphereGeometry(2, 16, 16);
const phongMaterialPropertiesforsaturn = {
    color: new THREE.Color(0x174B80), // Swampy green-blue color
    ambient: 0.5,                     // No ambient component
    diffusivity: 1.0,                 // Low diffuse component
    specularity: 1.0,                 // Maximum specular component
    smoothness: 100.0                  // Moderate shininess
};
const saturnMaterial = createPhongMaterial(phongMaterialPropertiesforsaturn);

saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
scene.add(saturn);

// Planet 3 Ring
let ring = null;
const ringGeometry = new THREE.RingGeometry(4.5, 2.5, 64);
const ringMaterial = new THREE.ShaderMaterial({
	uniforms: {
			color: { value: new THREE.Color(0x0000FF) } // Same color as Planet 3
	},
	vertexShader: `
			varying vec3 vPosition;
			void main() {
					vPosition = position;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
	`,
	fragmentShader: `
			uniform vec3 color;
			varying vec3 vPosition;

			void main() {
				// Calculate radial distance from the center
					float radialDistance = length(vPosition.xy);

					// Apply sinusoidal brightness variations for band effect
					float brightness = 0.5 + 0.5 * sin(radialDistance * 2.0); // Increase frequency for more rings
					vec3 finalColor = color * brightness;

					gl_FragColor = vec4(finalColor, 1.0);
			}
	`,
	side: THREE.DoubleSide // Ensures the ring is visible from both sides
});
ring = new THREE.Mesh(ringGeometry, ringMaterial);
saturn.add(ring);

// TODO: Create Planet 4: Soft Light Blue Planet
let earth = null;
const earthGeometry = new THREE.SphereGeometry(1, 16, 16);
const phongMaterialPropertiesforearth = {
    color: new THREE.Color(0x0000D1), // soft light blue
    ambient: 0.5,                     // No ambient component
    diffusivity: 1.0,                 // Low diffuse component
    specularity: 1.0,                 // Maximum specular component
    smoothness: 100.0                  // Moderate shininess
};
const earthMaterial = createPhongMaterial(phongMaterialPropertiesforearth);

earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);
// TODO: Create Planet 4's Moon
let moon = null;
const moonGeometry = new THREE.SphereGeometry(0.5, 16, 16); // Smaller size and fewer segments for the moon
const moonMaterial = new THREE.MeshPhongMaterial({
    color: 0x808080, // Pink color for the moon
    flatShading: true
});
moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

let mars = null;
const marsGeometry = new THREE.SphereGeometry(1, 16, 16);
const phongMaterialPropertiesformars = {
    color: new THREE.Color(0xFF5349), // soft orange red
    ambient: 0.5,                     // No ambient component
    diffusivity: 1.0,                 // Low diffuse component
    specularity: 1.0,                 // Maximum specular component
    smoothness: 100.0                  // Moderate shininess
};
const marsMaterial = createPhongMaterial(phongMaterialPropertiesformars);

mars = new THREE.Mesh(marsGeometry, marsMaterial);
scene.add(mars);

let jupiter = null;
const jupiterGeometry = new THREE.SphereGeometry(3, 16, 16);
const phongMaterialPropertiesforjupiter = {
    color: new THREE.Color(0xFF5349), // soft orange red
    ambient: 0.5,                     // No ambient component
    diffusivity: 1.0,                 // Low diffuse component
    specularity: 1.0,                 // Maximum specular component
    smoothness: 100.0                  // Moderate shininess
};
const jupiterMaterial = createPhongMaterial(phongMaterialPropertiesforjupiter);

jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
scene.add(jupiter);

let uranus = null;
const uranusGeometry = new THREE.SphereGeometry(1.8, 16, 16);
const phongMaterialPropertiesforuranus = {
    color: new THREE.Color(0x0000D1), // soft light blue
    ambient: 0.5,                     // No ambient component
    diffusivity: 1.0,                 // Low diffuse component
    specularity: 1.0,                 // Maximum specular component
    smoothness: 100.0                  // Moderate shininess
};
const uranusMaterial = createPhongMaterial(phongMaterialPropertiesforuranus);

uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
scene.add(uranus);


let neptune = null;
const neptuneGeometry = new THREE.SphereGeometry(1.8, 16, 16);
const phongMaterialPropertiesforneptune = {
    color: new THREE.Color(0xB08040), // Swampy green-blue color
    ambient: 0.5,                     // No ambient component
    diffusivity: 1.0,                 // Low diffuse component
    specularity: 1.0,                 // Maximum specular component
    smoothness: 100.0                  // Moderate shininess
};
const neptuneMaterial = createPhongMaterial(phongMaterialPropertiesforneptune);

neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
scene.add(neptune);



// TODO: Store planets and moon in an array for easy access,
// e.g. { mesh: mercury, distance: 5, speed: 1 },
planets = [
	{
		mesh: mercury,
		distance: 7,
		speed: 5 / 7 // Angular velocity for orbit: 1 rad/s
	},
	{
		mesh: venus,
    distance: 10,
    speed: 5 / 10
	},
	{
		mesh: earth,
    distance: 13,
    speed: 5 / 13
	},
	{
		mesh: moon,								// moon
		distance: 13,
		speed: 5/13
	},
	{
		mesh: mars,						//planet 5
		distance: 16,
		speed: 5/16
	},
	{
		mesh: jupiter,
    distance: 26,            // Orbit distance from the sun
    speed: 5 / 26
	},
	{
		mesh: saturn,
    distance: 32,            // Orbit distance from the sun
    speed: 5 / 32
	},
	{
		mesh: uranus,
    distance: 38,            // Orbit distance from the sun
    speed: 5 / 38
	},
	{
		mesh: neptune,
    distance: 42,            // Orbit distance from the sun
    speed: 5 / 42
	}

];

const asteroidCount = 500;               // Number of asteroids
const innerRadius = 18;                  // Inner radius of the belt
const outerRadius = 20;                  // Outer radius of the belt
const beltThickness = 1;                 // Thickness of the belt
const asteroids = [];



// Function to create a single asteroid
function createAsteroid() {
    const geometry = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 8, 8); // Random size for variation
    const material = new THREE.MeshPhongMaterial({ color: 0x888888, flatShading: true }); // Gray, rocky appearance
    const asteroid = new THREE.Mesh(geometry, material);

    // Randomly place the asteroid within the belt
    const angle = Math.random() * 2 * Math.PI; // Random angle for position around the Y-axis
    const radius = THREE.MathUtils.lerp(innerRadius, outerRadius, Math.random()); // Random radius within belt
    const height = (Math.random() - 0.5) * beltThickness; // Random height for thickness effect

    asteroid.position.set(
        Math.cos(angle) * radius, // X position based on the radius and angle
        height,                   // Y position for belt thickness
        Math.sin(angle) * radius  // Z position based on the radius and angle
    );

    // Rotate asteroid randomly for a scattered look
    asteroid.rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
    );

    // Add asteroid to the scene and array
    scene.add(asteroid);
    asteroids.push(asteroid);
}

// Create the entire asteroid belt
for (let i = 0; i < asteroidCount; i++) {
    createAsteroid();
}

function animateAsteroidBelt() {
    const rotationSpeed = 0.001; // Adjust speed for realistic orbiting

    asteroids.forEach(asteroid => {
        // Rotate each asteroid around the Y-axis to orbit around the sun
        asteroid.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationSpeed);
    });
}

// Kuiper Belt parameters
const kuiperBeltInnerRadius = 44;  // Inner radius from the Sun
const kuiperBeltOuterRadius = 60;  // Outer radius from the Sun
const kuiperBeltParticleCount = 5000;  // Number of particles in the Kuiper Belt

// Create a geometry to hold all particles
const kuiperBeltGeometry = new THREE.BufferGeometry();
const positions = [];

// Generate particles in the Kuiper Belt
for (let i = 0; i < kuiperBeltParticleCount; i++) {
    // Random angle and distance within the Kuiper Belt radius range
    const distance = THREE.MathUtils.randFloat(kuiperBeltInnerRadius, kuiperBeltOuterRadius);
    const angle = THREE.MathUtils.randFloat(0, 2 * Math.PI);

    // X and Z coordinates on the plane (disk shape)
    const x = distance * Math.cos(angle);
    const y = THREE.MathUtils.randFloat(-0.5, 0.5); // Slight randomization in Y for thickness
    const z = distance * Math.sin(angle);

    // Add the particle position
    positions.push(x, y, z);
}

// Set the positions attribute for the geometry
kuiperBeltGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

// Material for the Kuiper Belt particles
const kuiperBeltMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,            // White color for icy look
    size: 0.1,                  // Adjust particle size for visibility
    transparent: true,
    opacity: 0.8
});

// Create the Kuiper Belt using Points
const kuiperBelt = new THREE.Points(kuiperBeltGeometry, kuiperBeltMaterial);
scene.add(kuiperBelt);


// Handle window resize
window.addEventListener('resize', onWindowResize, false);

// Handle keyboard input
document.addEventListener('keydown', onKeyDown, false);

animate();

// TODO: Implement the Gouraud Shader for Planet 2
function createGouraudMaterial(materialProperties) {
    // TODO: Implement the Vertex Shader in GLSL
    let vertexShader = `
			precision mediump float;
        const int N_LIGHTS = 1;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
				uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        varying vec4 vColor;


				vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace);
            vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++) {
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector);
                vec3 L = normalize(surface_to_light_vector);
                vec3 H = normalize(L + E);
                float diffuse = max(dot(N, L), 0.0);
                float specular = pow(max(dot(N, H), 0.0), smoothness);
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }

        void main() {
						// the vertex's final reseting place( in NDCS):
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

						// the final normal vector in screen space
            vec3 N = normalize(normalMatrix * normal); // Normal vector in camera space
            vec3 vertex_worldspace = (modelMatrix * vec4(position, 1.0)).xyz;
            vec3 E = normalize(camera_center - vertex_worldspace);

						// Compute an initial (ambient) color:
						vec4 color = vec4(shape_color.xyz * ambient, shape_color.w);
						// Compute the final color with contributions from lights:
						color.xyz += phong_model_lights(normalize(N), vertex_worldspace);

						vColor = color;
        }
    `;

    // TODO: Implement the Fragment Shader in GLSL
    let fragmentShader = `
		precision mediump float;
        varying vec4 vColor;

        void main() {
            gl_FragColor = vColor; // Pass interpolated color from vertex shader
						return;
        }
		`;

    let shape_color = new THREE.Vector4(
        materialProperties.color.r,
        materialProperties.color.g,
        materialProperties.color.b,
        1.0
    );

    // Uniforms
    const uniforms = {
        ambient: { value: materialProperties.ambient },
        diffusivity: { value: materialProperties.diffusivity },
        specularity: { value: materialProperties.specularity },
        smoothness: { value: materialProperties.smoothness },
        shape_color: { value: shape_color },
        squared_scale: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        camera_center: { value: new THREE.Vector3() },
        model_transform: { value: new THREE.Matrix4() },
        projection_camera_model_transform: { value: new THREE.Matrix4() },
        light_positions_or_vectors: { value: [] },
        light_colors: { value: [] },
        light_attenuation_factors: { value: [] }
    };

    // Create the ShaderMaterial using the custom vertex and fragment shaders
    return new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms
    });
}

// Custom Phong Shader has already been implemented, no need to make change.
function createPhongMaterial(materialProperties) {
    const numLights = 1;
    // Vertex Shader
    let vertexShader = `
        precision mediump float;
        const int N_LIGHTS = ${numLights};
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale;
        uniform vec3 camera_center;
        varying vec3 N, vertex_worldspace;

        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace);
            vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++) {
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector);
                vec3 L = normalize(surface_to_light_vector);
                vec3 H = normalize(L + E);
                float diffuse = max(dot(N, L), 0.0);
                float specular = pow(max(dot(N, H), 0.0), smoothness);
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }

        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;

        void main() {
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);
            N = normalize(mat3(model_transform) * normal / squared_scale);
            vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
        }
    `;
    // Fragment Shader
    let fragmentShader = `
        precision mediump float;
        const int N_LIGHTS = ${numLights};
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 camera_center;
        varying vec3 N, vertex_worldspace;

        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace);
            vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++) {
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector);
                vec3 L = normalize(surface_to_light_vector);
                vec3 H = normalize(L + E);
                float diffuse = max(dot(N, L), 0.0);
                float specular = pow(max(dot(N, H), 0.0), smoothness);
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }

        void main() {
            // Compute an initial (ambient) color:
            vec4 color = vec4(shape_color.xyz * ambient, shape_color.w);
            // Compute the final color with contributions from lights:
            color.xyz += phong_model_lights(normalize(N), vertex_worldspace);
            gl_FragColor = color;
        }
    `;

    let shape_color = new THREE.Vector4(
        materialProperties.color.r,
        materialProperties.color.g,
        materialProperties.color.b,
        1.0
    );
    // Prepare uniforms
    const uniforms = {
        ambient: { value: materialProperties.ambient },
        diffusivity: { value: materialProperties.diffusivity },
        specularity: { value: materialProperties.specularity },
        smoothness: { value: materialProperties.smoothness },
        shape_color: { value: shape_color },
        squared_scale: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        camera_center: { value: new THREE.Vector3() },
        model_transform: { value: new THREE.Matrix4() },
        projection_camera_model_transform: { value: new THREE.Matrix4() },
        light_positions_or_vectors: { value: [] },
        light_colors: { value: [] },
        light_attenuation_factors: { value: [] }
    };

    // Create the ShaderMaterial using the custom vertex and fragment shaders
    return new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms
    });
}

// TODO: Finish the custom shader for planet 3's ring with sinusoidal brightness variation
function createRingMaterial(materialProperties) {
    let vertexShader = `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
    `;

    // TODO: Finish the fragment shader to create the brightness variation with sinine finction
    let fragmentShader = `
        uniform vec3 color;
        varying vec3 vPosition;

        void main() {

        }
    `;

    // TODO: Fill in the values to be passed in to create the custom shader
    return new THREE.ShaderMaterial({
        uniforms: {color: null},

    });
}

// This function is used to update the uniform of the planet's materials in the animation step. No need to make any change
function updatePlanetMaterialUniforms(planet) {
    const material = planet.material;
    if (!material.uniforms) return;

    const uniforms = material.uniforms;

    const numLights = 1;
    const lights = scene.children.filter(child => child.isLight).slice(0, numLights);
    // Ensure we have the correct number of lights
    if (lights.length < numLights) {
        console.warn(`Expected ${numLights} lights, but found ${lights.length}. Padding with default lights.`);
    }

    // Update model_transform and projection_camera_model_transform
    planet.updateMatrixWorld();
    camera.updateMatrixWorld();

    uniforms.model_transform.value.copy(planet.matrixWorld);
    uniforms.projection_camera_model_transform.value.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
    ).multiply(planet.matrixWorld);

    // Update camera_center
    uniforms.camera_center.value.setFromMatrixPosition(camera.matrixWorld);

    // Update squared_scale (in case the scale changes)
    const scale = planet.scale;
    uniforms.squared_scale.value.set(
        scale.x * scale.x,
        scale.y * scale.y,
        scale.z * scale.z
    );

    // Update light uniforms
    uniforms.light_positions_or_vectors.value = [];
    uniforms.light_colors.value = [];
    uniforms.light_attenuation_factors.value = [];

    for (let i = 0; i < numLights; i++) {
        const light = lights[i];
        if (light) {
            let position = new THREE.Vector4();
            if (light.isDirectionalLight) {
                // For directional lights
                const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(light.quaternion);
                position.set(direction.x, direction.y, direction.z, 0.0);
            } else if (light.position) {
                // For point lights
                position.set(light.position.x, light.position.y, light.position.z, 1.0);
            } else {
                // Default position
                position.set(0.0, 0.0, 0.0, 1.0);
            }
            uniforms.light_positions_or_vectors.value.push(position);

            // Update light color
            const color = new THREE.Vector4(light.color.r, light.color.g, light.color.b, 1.0);
            uniforms.light_colors.value.push(color);

            // Update attenuation factor
            let attenuation = 0.0;
            if (light.isPointLight || light.isSpotLight) {
                const distance = light.distance || 1000.0; // Default large distance
                attenuation = 1.0 / (distance * distance);
            } else if (light.isDirectionalLight) {
                attenuation = 0.0; // No attenuation for directional lights
            }
            // Include light intensity
            const intensity = light.intensity !== undefined ? light.intensity : 1.0;
            attenuation *= intensity;

            uniforms.light_attenuation_factors.value.push(attenuation);
        } else {
            // Default light values
            uniforms.light_positions_or_vectors.value.push(new THREE.Vector4(0.0, 0.0, 0.0, 0.0));
            uniforms.light_colors.value.push(new THREE.Vector4(0.0, 0.0, 0.0, 1.0));
            uniforms.light_attenuation_factors.value.push(0.0);
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// TODO: Implement the camera attachment given the key being pressed
// Hint: This step you only need to determine the object that are attached to and assign it to a variable you have to store the attached object.

function onKeyDown(event) {
    switch (event.keyCode) {
			case 48: // '0' key - Detach camera
					attachedObject = null;
					break;
			case 49: attachedObject = 0; break; // mercury
			case 50: attachedObject = 1; break; // venus
			case 51: attachedObject = 2; break; // earth
			case 52: attachedObject = 3; break; // Moon
			case 53: attachedObject = 4; break; // planet 4
			case 54: attachedObject = 5; break; // planet 5
			case 55: attachedObject = 6; break; // planet 4
			case 56: attachedObject = 7; break; // planet 5
    }
}

function animate() {
    requestAnimationFrame(animate);

    let time = clock.getElapsedTime();
		let seconds = Math.floor(time);

    // TODO: Animate sun radius and color
    let period10 = time % 10.0;
		let animationFactor = (time % 10) / 5;
    if (animationFactor > 1) animationFactor = 2 - animationFactor; // Mirror effect for shrinking

		let sunRadius = 3;
    sun.scale.set(sunRadius, sunRadius, sunRadius);

    // Animate the Sun's color from red (smallest) to white (largest)
    let sunColor = new THREE.Color(0XFDB813);
    sun.material.color.set(sunColor);

		// TODO: Update sun light
		sunLight.color.set(sunColor);
	 	// sunLight.power = Math.pow(10, sunRadius); // Power = 10^n where n is the sun's radius



    // TODO: Loop through all the orbiting planets and apply transformation to create animation effect
    planets.forEach(function (obj, index) {
        let planet = obj.mesh
        let distance = obj.distance
        let speed = obj.speed

        let model_transform = new THREE.Matrix4();
				let orbitalAngle = -1* speed * time;

				const orbitalSpeed = translationMatrix(distance * Math.cos(orbitalAngle), 0, distance * Math.sin(orbitalAngle));


				if (index == 6) {
            // Calculate wobble angles using sinusoidal functions
            const wobblex = rotationMatrixX(Math.sin(time));
						const wobblez = rotationMatrixX(Math.cos(time));
						model_transform.multiplyMatrices(wobblex, model_transform);
						model_transform.multiplyMatrices(wobblez, model_transform);
						model_transform.multiplyMatrices(orbitalSpeed, model_transform);
        }
				else if (index == 3) //eath
				{

						const moonOrbit = translationMatrix(2 * Math.cos(3 * orbitalAngle), 0 , 2 * Math.sin(3 * orbitalAngle));
						model_transform.multiplyMatrices(orbitalSpeed, model_transform);
						model_transform.multiplyMatrices(moonOrbit, model_transform);
				}
				else {
						model_transform.multiplyMatrices(orbitalSpeed, model_transform);
				}

				planet.matrix.copy(model_transform);
        planet.matrixAutoUpdate = false;



        // TODO: Implement the model transformations for the planets
        // Hint: Some of the planets have the same set of transformation matrices, but for some you have to apply some additional transformation to make it work (e.g. earth's moon, saturn's wobbling effect(optional)).

        // Camera attachment logic here, when certain planet is being attached, we want the camera to be following the planet by having the same transformation as the planet itself. No need to make changes.
				if (attachedObject === index){
            let cameraTransform = new THREE.Matrix4();

            // Copy the transformation of the planet (Hint: for the wobbling planet 3, you might have to rewrite to the model_tranform so that the camera won't wobble together)
            cameraTransform.copy(model_transform);

            // Add a translation offset of (0, 0, 10) in front of the planet
            let offset = translationMatrix(0, 0, 10);
            cameraTransform.multiply(offset);

            // Apply the new transformation to the camera position
            let cameraPosition = new THREE.Vector3();
            cameraPosition.setFromMatrixPosition(cameraTransform);
            camera.position.lerp(cameraPosition, blendingFactor);

            // Make the camera look at the planet
            let planetPosition = new THREE.Vector3();
            planetPosition.setFromMatrixPosition(planet.matrix);
            camera.lookAt(planetPosition);

            // Disable controls
            controls.enabled = false;
        }

        // TODO: If camera is detached, slowly lerp the camera back to the original position and look at the origin
        else if (attachedObject === null) {
						// Transition camera back to default position (0, 10, 20) and look at the origin
						// let defaultPosition = new THREE.Vector3(0, 10, 20);
						// camera.position.lerp(defaultPosition, blendingFactor);
						// camera.lookAt(0, 0, 0);

            // Enable controls
            controls.enabled = true;
        }

    });

    // TODO: Apply Gouraud/Phong shading alternatively to Planet 2
		if (seconds % 2 === 0) {
				venus.material = createPhongMaterial(phongMaterialProperties);
		} else {
				venus.material = createGouraudMaterial(phongMaterialProperties);
		}

    // TODO: Update customized planet material uniforms
    // e.g. updatePlanetMaterialUniforms(planets[1].mesh);
		updatePlanetMaterialUniforms(venus);
		updatePlanetMaterialUniforms(saturn);
		updatePlanetMaterialUniforms(earth);
		updatePlanetMaterialUniforms(mars);
		updatePlanetMaterialUniforms(jupiter);
		updatePlanetMaterialUniforms(uranus);
		updatePlanetMaterialUniforms(neptune);

    // Update controls only when the camera is not attached
    if (controls.enabled) {
        controls.update();
    }

		animateAsteroidBelt();

    renderer.render(scene, camera);
}
