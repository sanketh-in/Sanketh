export const TOPICS = [
  {
    id: "newton",
    subject: "Physics",
    title: "Newton's Laws of Motion",
    subtitle: "The three fundamental laws governing how objects move",
    emoji: "⚛️",
    image: "signs/edu_atom.png",
    grade: "Class 9–11",
    color: "#7c3aed",
    colorLight: "rgba(124,58,237,0.1)",
    lessons: [
      {
        number: 1,
        name: "Law of Inertia",
        definition: "An object at rest stays at rest, and an object in motion stays in motion at the same speed and direction — unless acted on by an external force.",
        signs: [
          { word: "Object", image: "signs/edu_object.png", description: "Any physical thing that has mass", howTo: "Hold non-dominant palm up, tap dominant flat O-shape onto it twice — representing a concrete 'thing'." },
          { word: "Rest", image: "signs/edu_rest.png", description: "Completely still, not moving", howTo: "Hold both flat palms down in front of you, completely still — showing no movement." },
          { word: "Motion", image: "signs/edu_motion.png", description: "Moving continuously in a direction", howTo: "Move both index fingers forward in a flowing wave-like motion — showing continuous movement." },
          { word: "Force", image: "signs/edu_force.png", description: "An external push or pull", howTo: "Push dominant hand forcefully forward — showing an external push acting on something." },
        ]
      },
      {
        number: 2,
        name: "Law of Acceleration",
        definition: "The acceleration of an object depends on the net force and its mass. Greater force → greater acceleration. Greater mass → less acceleration.",
        formula: "F = m × a",
        signs: [
          { word: "Force", image: "signs/edu_force.png", description: "A push or pull acting on an object", howTo: "Push dominant hand forcefully forward — representing force applied." },
          { word: "Equal", image: "signs/edu_equal.png", description: "Both sides are the same", howTo: "Hold both flat hands parallel at chest — representing equality: F = ma." },
          { word: "Mass", image: "signs/edu_mass.png", description: "How much matter an object contains", howTo: "Hold both hands cupped downward as if holding a heavy weight — mass resists being moved." },
          { word: "Acceleration", image: "signs/edu_acceleration.png", description: "Increasing speed over time", howTo: "Move both fists quickly forward and upward — showing rapid increase in velocity." },
        ]
      },
      {
        number: 3,
        name: "Law of Action–Reaction",
        definition: "For every action, there is an equal and opposite reaction. When one object exerts a force on another, the second exerts an equal force back.",
        signs: [
          { word: "Action", image: "signs/edu_action.png", description: "A force applied in one direction", howTo: "Strike dominant hand decisively forward — representing a deliberate action." },
          { word: "Equal", image: "signs/edu_equal.png", description: "The same in magnitude", howTo: "Hold both flat hands parallel — showing that action and reaction are equal." },
          { word: "Opposite", image: "signs/edu_opposite.png", description: "In the reverse direction", howTo: "Touch both index fingers together, then pull apart in opposite directions." },
          { word: "Reaction", image: "signs/edu_reaction.png", description: "The return force in reverse", howTo: "Pull both hands back toward yourself — showing the equal force returning in reverse." },
        ]
      }
    ]
  },
  {
    id: "periodic",
    subject: "Chemistry",
    title: "The Periodic Table",
    subtitle: "Elements, atomic structure, and how the table is organized",
    emoji: "🧪",
    image: "signs/edu_element.png",
    grade: "Class 8–11",
    color: "#0891b2",
    colorLight: "rgba(8,145,178,0.1)",
    lessons: [
      {
        number: 1,
        name: "What is an Element?",
        definition: "A chemical element is a pure substance made of only one kind of atom. Every element has a unique atomic number — the number of protons in its nucleus.",
        signs: [
          { word: "Element", image: "signs/edu_element.png", description: "A pure substance of one atom type", howTo: "Make E-handshape (fingers curled touching thumb) and move it in a small circle — representing a distinct chemical element." },
          { word: "Atom", image: "signs/edu_atom.png", description: "The basic unit of matter", howTo: "Circle one hand around the other — the outer hand orbits like electrons around a nucleus." },
          { word: "Period", image: "signs/edu_period.png", description: "A horizontal row in the table", howTo: "Move both index fingers horizontally from left to right — tracing a row (period) across the table." },
          { word: "Group", image: "signs/edu_group.png", description: "A vertical column in the table", howTo: "Move both hands downward in parallel — tracing a column (group) down the periodic table." },
        ]
      },
      {
        number: 2,
        name: "Inside the Atom",
        definition: "Every atom has a nucleus containing protons (positive charge) and neutrons (no charge), surrounded by electrons (negative charge) orbiting in shells.",
        formula: "Atomic No. = Protons",
        signs: [
          { word: "Atom", image: "signs/edu_atom.png", description: "Nucleus surrounded by electron shells", howTo: "Circle one hand around the other — electrons orbiting the central nucleus." },
          { word: "Proton", image: "signs/edu_proton.png", description: "Positive particle in the nucleus", howTo: "Make P-handshape and move forward — the + sign shape reminds us protons are positive." },
          { word: "Electron", image: "signs/edu_electron.png", description: "Negative particle orbiting nucleus", howTo: "Circle your index finger rapidly around your fist — an electron orbiting the nucleus at high speed." },
          { word: "Equal", image: "signs/edu_equal.png", description: "Balanced positive and negative charges", howTo: "Hold both parallel hands steady — a stable atom has equal protons and electrons." },
        ]
      },
      {
        number: 3,
        name: "Groups & Periods",
        definition: "Elements in the same group share similar properties. Elements in the same period have the same number of electron shells. There are 18 groups and 7 periods.",
        signs: [
          { word: "Group", image: "signs/edu_group.png", description: "Vertical column — shared properties", howTo: "Move both hands downward in parallel — tracing a vertical column of elements with similar properties." },
          { word: "Period", image: "signs/edu_period.png", description: "Horizontal row — same shell count", howTo: "Sweep both index fingers horizontally left to right — tracing a period (row) in the table." },
          { word: "Element", image: "signs/edu_element.png", description: "Each square in the periodic table", howTo: "Make E-handshape and circle it — each element is a unique substance with its own square." },
          { word: "Mass", image: "signs/edu_mass.png", description: "Atomic mass — total of protons + neutrons", howTo: "Hold both hands low as if weighing something heavy — atomic mass is the total weight of the atom's core." },
        ]
      }
    ]
  },
  {
    id: "biology",
    subject: "Biology",
    title: "Cell Structure",
    subtitle: "The basic unit of life — what cells are made of and how they work",
    emoji: "🔬",
    image: "signs/edu_cell.png",
    grade: "Class 8–11",
    color: "#dc2626",
    colorLight: "rgba(220,38,38,0.1)",
    lessons: [
      {
        number: 1,
        name: "What is a Cell?",
        definition: "A cell is the basic structural and functional unit of all living organisms. Every living thing is made of cells — from a single bacterium to the trillions of cells in the human body.",
        signs: [
          { word: "Living", image: "signs/edu_life.png", description: "Having life — growing and responding", howTo: "Move both L-handshapes (index and thumb out) upward from waist — showing the rising energy of life." },
          { word: "Cell", image: "signs/edu_cell.png", description: "The smallest unit of life", howTo: "Form two curved C-hands and hold them together forming a rounded enclosure — like the boundary of a cell." },
          { word: "Membrane", image: "signs/edu_membrane.png", description: "The outer boundary of the cell", howTo: "Hold both flat hands curved and facing each other — tracing the protective outer wall of the cell." },
          { word: "Nucleus", image: "signs/edu_nucleus.png", description: "The control center of the cell", howTo: "Hold your dominant fist inside the cupped non-dominant hand — the fist is the nucleus inside the cell." },
        ]
      },
      {
        number: 2,
        name: "Cell Organelles",
        definition: "Inside the cell are tiny structures called organelles, each with a specific job. The nucleus stores DNA, mitochondria produce energy, and cytoplasm holds everything in place.",
        formula: "Mitochondria = Powerhouse",
        signs: [
          { word: "Nucleus", image: "signs/edu_nucleus.png", description: "Stores DNA and controls the cell", howTo: "Dominant fist held inside cupped non-dominant hand — the protected nucleus at the center." },
          { word: "DNA", image: "signs/edu_dna.png", description: "Genetic blueprint stored in the nucleus", howTo: "Spiral both index fingers around each other in a double helix — the iconic structure of DNA." },
          { word: "Mitochondria", image: "signs/edu_mitochondria.png", description: "Produces energy for the cell (ATP)", howTo: "Both fists move in energetic circles — representing the constant energy-producing powerhouse." },
          { word: "Cytoplasm", image: "signs/edu_cytoplasm.png", description: "Fluid that fills the cell and holds organelles", howTo: "Both open hands wave gently — showing the fluid that surrounds and supports all cell organelles." },
        ]
      },
      {
        number: 3,
        name: "Cell Division",
        definition: "Cells reproduce by dividing. In mitosis, one cell splits into two identical daughter cells. Each new cell gets a complete copy of the DNA through the chromosomes.",
        formula: "1 cell → 2 cells",
        signs: [
          { word: "Chromosome", image: "signs/edu_chromosome.png", description: "Packages of DNA passed to new cells", howTo: "Interlock both curved hands — chromosomes pair up before dividing to copy DNA into each new cell." },
          { word: "DNA", image: "signs/edu_dna.png", description: "Copied into each daughter cell", howTo: "Spiral both index fingers in a double helix — DNA replicates before division so each cell gets a full copy." },
          { word: "Divide", image: "signs/edu_divide.png", description: "One cell splits into two", howTo: "Start with both flat hands together then sweep them apart — one cell becoming two identical daughter cells." },
          { word: "Grow", image: "signs/edu_grow.png", description: "New cells grow to full size", howTo: "Rise the dominant hand upward with fingers opening — the new daughter cells grow and develop after division." },
        ]
      }
    ]
  },
  {
    id: "pythagoras",
    subject: "Mathematics",
    title: "Pythagorean Theorem",
    subtitle: "The relationship between sides of a right-angled triangle",
    emoji: "📐",
    image: "signs/edu_triangle.png",
    grade: "Class 7–10",
    color: "#059669",
    colorLight: "rgba(5,150,105,0.1)",
    lessons: [
      {
        number: 1,
        name: "What is a Right Triangle?",
        definition: "A right triangle is a triangle with one angle exactly equal to 90°. The three sides are called the two legs (a and b) and the hypotenuse (c — the longest side).",
        signs: [
          { word: "Triangle", image: "signs/edu_triangle.png", description: "A three-sided polygon", howTo: "Use both index fingers to trace a triangle shape in the air — start at the apex, go down to base left, across, and back up." },
          { word: "Right Angle", image: "signs/edu_right_angle.png", description: "An angle of exactly 90°", howTo: "Form an L-shape with both index fingers touching at 90° — one horizontal, one vertical, meeting at a precise right angle." },
          { word: "Square", image: "signs/edu_square.png", description: "A four-sided shape with equal sides", howTo: "Trace a square in the air with both index fingers — across the top, down both sides, and across the bottom." },
          { word: "Equal", image: "signs/edu_equal.png", description: "Both sides of the equation match", howTo: "Hold both flat hands parallel and steady — representing the equals sign in a² + b² = c²." },
        ]
      },
      {
        number: 2,
        name: "The Theorem",
        definition: "In a right-angled triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.",
        formula: "a² + b² = c²",
        signs: [
          { word: "Square", image: "signs/edu_square.png", description: "Side × side — a², b², c²", howTo: "Trace a square shape in the air — representing squaring a number (multiplying it by itself)." },
          { word: "Hypotenuse", image: "signs/edu_hypotenuse.png", description: "The longest side, opposite the right angle", howTo: "Draw a diagonal line from lower-left to upper-right in the air — the hypotenuse cuts across the right angle." },
          { word: "Equal", image: "signs/edu_equal.png", description: "a² + b² equals c²", howTo: "Hold both flat hands parallel — the left side (a²+b²) equals the right side (c²)." },
          { word: "Right Angle", image: "signs/edu_right_angle.png", description: "The 90° corner of the triangle", howTo: "Form an L-shape with both index fingers — the right angle is always opposite the hypotenuse." },
        ]
      },
      {
        number: 3,
        name: "Applying the Theorem",
        definition: "Use a² + b² = c² to find a missing side. If a = 3 and b = 4, then c² = 9 + 16 = 25, so c = 5. This is the famous 3-4-5 right triangle!",
        formula: "3² + 4² = 5²",
        signs: [
          { word: "Triangle", image: "signs/edu_triangle.png", description: "The shape we are solving", howTo: "Trace a triangle in the air — we are finding the missing side of this triangle." },
          { word: "Hypotenuse", image: "signs/edu_hypotenuse.png", description: "The side we often need to find", howTo: "Draw a diagonal line in the air — the hypotenuse is what we calculate using the theorem." },
          { word: "Square", image: "signs/edu_square.png", description: "Square each side's length first", howTo: "Trace a square in the air — we square each leg's length (3²=9, 4²=16) before adding." },
          { word: "Equal", image: "signs/edu_equal.png", description: "The answer equals the hypotenuse squared", howTo: "Hold both parallel hands steady — 9 + 16 = 25, so c = 5." },
        ]
      }
    ]
  }
];
