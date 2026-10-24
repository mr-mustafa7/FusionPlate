// Offline-safe canned responses so the demo never dies on a flaky connection,
// missing API key, or rate limit mid-judging (see demo reliability checklist).

export const MOCK_FUSIONS = [
  {
    extraction: {
      fridgeIngredients: ["eggs", "leftover rice", "kimchi", "cheddar cheese", "spring onion"],
      cravingDish: "carbonara",
      cravingCuisine: "Italian",
      cravingFlavorNotes: ["creamy", "savory", "peppery", "rich"]
    },
    recipe: {
      title: "Kimchi Carbonara Fried Rice",
      tagline: "Rome meets Seoul in one very confused, very delicious pan.",
      fusedCuisines: ["Italian", "Korean"],
      fusionScore: { fridgePercent: 65, cravingPercent: 35 },
      ingredients: [
        { item: "leftover rice", have: true },
        { item: "eggs", have: true },
        { item: "kimchi", have: true },
        { item: "cheddar cheese", have: true },
        { item: "spring onion", have: true },
        { item: "black pepper", have: false },
        { item: "parmesan (optional, for the carbonara soul)", have: false }
      ],
      steps: [
        "Crisp chopped kimchi in a hot pan until the edges catch a little char.",
        "Push kimchi aside, add rice, and fry until each grain separates.",
        "Whisk eggs with a fistful of grated cheddar off-heat (this is your 'carbonara sauce').",
        "Kill the heat, fold the egg-cheese mix through the hot rice fast so it goes silky, not scrambled.",
        "Finish with cracked black pepper and sliced spring onion.",
        "Taste, add kimchi juice if it needs more punch."
      ],
      platingTip: "Pile high in a shallow bowl, extra cheddar snowed on top, one perfect curl of kimchi on the peak.",
      funFactOrTwist: "Carbonara's whole trick is egg-as-sauce — kimchi's fermented funk just steps in for guanciale's."
    }
  },
  {
    extraction: {
      fridgeIngredients: ["tortillas", "canned chickpeas", "feta", "cherry tomatoes", "yogurt"],
      cravingDish: "falafel wrap",
      cravingCuisine: "Middle Eastern",
      cravingFlavorNotes: ["zesty", "herby", "tangy", "fresh"]
    },
    recipe: {
      title: "Chickpea Smash Quesafel",
      tagline: "A falafel that gave up rolling itself into balls and became a quesadilla instead.",
      fusedCuisines: ["Middle Eastern", "Mexican"],
      fusionScore: { fridgePercent: 70, cravingPercent: 30 },
      ingredients: [
        { item: "canned chickpeas", have: true },
        { item: "tortillas", have: true },
        { item: "feta", have: true },
        { item: "cherry tomatoes", have: true },
        { item: "yogurt", have: true },
        { item: "cumin", have: false },
        { item: "garlic", have: false }
      ],
      steps: [
        "Roughly smash chickpeas with cumin and garlic — leave texture, don't puree.",
        "Spread the smash across half a tortilla, crumble feta over it, fold.",
        "Dry-toast in a pan until the tortilla blisters and the feta slumps.",
        "Mix yogurt with chopped cherry tomatoes for a quick tangy salsa-raita.",
        "Slice the quesafel into wedges, serve with the salsa-raita for dipping."
      ],
      platingTip: "Fan the wedges like a quesadilla platter, salsa-raita in a small bowl at the center.",
      funFactOrTwist: "Falafel and quesadillas are both 'crispy pocket of mashed legume/cheese' at heart — this just admits it."
    }
  },
  {
    tags: ["spooky"],
    extraction: {
      fridgeIngredients: ["ramen noodles", "pumpkin puree", "coconut milk", "chili flakes", "lime"],
      cravingDish: "pumpkin spice latte",
      cravingCuisine: "American cafe",
      cravingFlavorNotes: ["warm spice", "sweet", "creamy", "autumnal"]
    },
    recipe: {
      title: "Spooky Pumpkin Spice Ramen",
      tagline: "Everything the pumpkin spice latte wishes it had the courage to become.",
      fusedCuisines: ["Japanese", "American cafe"],
      fusionScore: { fridgePercent: 60, cravingPercent: 40 },
      ingredients: [
        { item: "ramen noodles", have: true },
        { item: "pumpkin puree", have: true },
        { item: "coconut milk", have: true },
        { item: "chili flakes", have: true },
        { item: "lime", have: true },
        { item: "cinnamon + nutmeg", have: false },
        { item: "soy sauce", have: false }
      ],
      steps: [
        "Simmer pumpkin puree with coconut milk until it loosens into a broth.",
        "Stir in a pinch of cinnamon and nutmeg — just enough to whisper 'latte', not 'dessert'.",
        "Season the broth with soy sauce and chili flakes until it's savory first, sweet second.",
        "Cook ramen noodles separately, drain, drop into the broth.",
        "Finish with a squeeze of lime to cut the richness.",
        "Serve in a mug for maximum pumpkin-spice-latte cosplay."
      ],
      platingTip: "Serve in a clear mug so the orange broth shows — garnish with a cinnamon-stick 'straw'.",
      funFactOrTwist: "Pumpkin, warm spice, and a creamy base are the actual flavor skeleton of a PSL — ramen just gives it a spine."
    }
  },
  {
    extraction: {
      fridgeIngredients: ["leftover roast chicken", "tortillas", "lime", "cilantro", "fresh ginger"],
      cravingDish: "pho",
      cravingCuisine: "Vietnamese",
      cravingFlavorNotes: ["fragrant broth", "fresh herbs", "warm spice", "bright"]
    },
    recipe: {
      title: "Pho-ded Chicken Tacos",
      tagline: "A bowl of pho that got folded in half and handed to you.",
      fusedCuisines: ["Vietnamese", "Mexican"],
      fusionScore: { fridgePercent: 55, cravingPercent: 45 },
      ingredients: [
        { item: "leftover roast chicken", have: true },
        { item: "tortillas", have: true },
        { item: "lime", have: true },
        { item: "cilantro", have: true },
        { item: "fresh ginger", have: true },
        { item: "star anise", have: false },
        { item: "fish sauce", have: false }
      ],
      steps: [
        "Simmer shredded chicken in water with ginger and star anise until the kitchen smells like a pho stall.",
        "Reduce until it's less a broth, more a glaze — season with fish sauce and lime.",
        "Warm tortillas, pile the glazed chicken down the center.",
        "Top with torn cilantro and a squeeze of lime, fold like a taco.",
        "Serve with extra lime wedges and a tiny cup of the reduced broth for dipping."
      ],
      platingTip: "Line the tacos up taco-truck style with the dipping broth in a shot glass on the side.",
      funFactOrTwist: "Pho's whole soul is an aromatic broth — this just reduces that broth until it's a glaze instead of a soup."
    }
  },
  {
    extraction: {
      fridgeIngredients: ["potatoes", "cheddar cheese", "bacon bits", "sour cream", "butter"],
      cravingDish: "korean fried chicken",
      cravingCuisine: "Korean",
      cravingFlavorNotes: ["sticky-sweet", "spicy", "crispy", "glazed"]
    },
    recipe: {
      title: "Gochujang Loaded Potato Bites",
      tagline: "Your loaded baked potato just got a Seoul.",
      fusedCuisines: ["Korean", "American"],
      fusionScore: { fridgePercent: 68, cravingPercent: 32 },
      ingredients: [
        { item: "potatoes", have: true },
        { item: "cheddar cheese", have: true },
        { item: "bacon bits", have: true },
        { item: "sour cream", have: true },
        { item: "butter", have: true },
        { item: "gochujang", have: false },
        { item: "honey", have: false }
      ],
      steps: [
        "Roast potato halves until crisp-skinned and fluffy inside.",
        "Whisk gochujang, honey, and melted butter into a sticky glaze.",
        "Brush the glaze thick over the hot potatoes.",
        "Scatter cheddar and bacon bits on top, broil until the cheese bubbles.",
        "Finish with a drizzle of sour cream and a pinch more gochujang for the brave."
      ],
      platingTip: "Serve on a dark slate board, glaze drizzled in a zigzag like a diner special.",
      funFactOrTwist: "Korean fried chicken's genius is the sticky-sweet-spicy glaze — turns out that glaze works on absolutely anything fried or roasted."
    }
  },
  {
    extraction: {
      fridgeIngredients: ["canned tuna", "mayonnaise", "sweet corn", "nori sheets", "rice"],
      cravingDish: "margherita pizza",
      cravingCuisine: "Italian",
      cravingFlavorNotes: ["melty cheese", "tomato", "basil", "comforting"]
    },
    recipe: {
      title: "Onigiri Margherita Bites",
      tagline: "A rice ball and a pizza slice had an argument and this is the truce.",
      fusedCuisines: ["Japanese", "Italian"],
      fusionScore: { fridgePercent: 62, cravingPercent: 38 },
      ingredients: [
        { item: "rice", have: true },
        { item: "nori sheets", have: true },
        { item: "canned tuna", have: true },
        { item: "sweet corn", have: true },
        { item: "mayonnaise", have: true },
        { item: "mozzarella", have: false },
        { item: "cherry tomatoes", have: false }
      ],
      steps: [
        "Pack warm rice into flat discs, like mini pizza bases.",
        "Mix tuna, corn, and mayo into a quick topping.",
        "Pile the tuna-corn mix onto each rice disc, top with halved cherry tomatoes and torn mozzarella.",
        "Broil just until the cheese melts and the rice edges crisp.",
        "Wrap a nori strip around the base of each like a pizza-slice belt."
      ],
      platingTip: "Arrange in a circle like a sliced pizza, nori strips facing outward for the full illusion.",
      funFactOrTwist: "A rice disc browned in a hot pan behaves a lot like a thick pizza base — the nori just admits which cuisine lent the crust."
    }
  },
  {
    extraction: {
      fridgeIngredients: ["red lentils", "canned tomatoes", "cumin", "garlic", "spinach"],
      cravingDish: "cheeseburger",
      cravingCuisine: "American",
      cravingFlavorNotes: ["juicy", "charred", "savory", "hearty"]
    },
    recipe: {
      title: "Dal Smash Burger",
      tagline: "The humble lentil, living its best patty life.",
      fusedCuisines: ["Indian", "American"],
      fusionScore: { fridgePercent: 72, cravingPercent: 28 },
      ingredients: [
        { item: "red lentils", have: true },
        { item: "canned tomatoes", have: true },
        { item: "cumin", have: true },
        { item: "garlic", have: true },
        { item: "spinach", have: true },
        { item: "burger buns", have: false },
        { item: "cheddar cheese", have: false }
      ],
      steps: [
        "Simmer lentils with tomatoes, cumin, and garlic until thick enough to hold a shape.",
        "Fold in chopped spinach, cool, then form into patties.",
        "Sear hard in a very hot pan until a deep crust forms on both sides.",
        "Melt cheddar over each patty in the last minute of cooking.",
        "Stack in a toasted bun with your usual burger fixings."
      ],
      platingTip: "Stack tall and skewer with a toothpick, fries fanned out alongside like a diner plate.",
      funFactOrTwist: "Dal already has the dense, savory thing a good burger patty needs — this just gives it a bun and a sear."
    }
  },
  {
    extraction: {
      fridgeIngredients: ["puff pastry", "chocolate hazelnut spread", "bananas", "cinnamon"],
      cravingDish: "churros",
      cravingCuisine: "Mexican",
      cravingFlavorNotes: ["cinnamon sugar", "crisp", "sweet", "warm"]
    },
    recipe: {
      title: "Churro Banana Pastry Twists",
      tagline: "Croissant dough that moved to Mexico and never looked back.",
      fusedCuisines: ["French", "Mexican"],
      fusionScore: { fridgePercent: 66, cravingPercent: 34 },
      ingredients: [
        { item: "puff pastry", have: true },
        { item: "chocolate hazelnut spread", have: true },
        { item: "bananas", have: true },
        { item: "cinnamon", have: true },
        { item: "sugar", have: false },
        { item: "butter (for brushing)", have: false }
      ],
      steps: [
        "Roll out puff pastry, spread a thin layer of chocolate hazelnut spread across it.",
        "Lay thin banana slices down one side, fold and twist into a rope.",
        "Brush with melted butter and roll in cinnamon sugar.",
        "Bake until deep golden and crisp at the edges.",
        "Serve warm while the chocolate is still molten inside."
      ],
      platingTip: "Stand the twists upright in a glass like churros at a street cart, extra cinnamon sugar dusted over the top.",
      funFactOrTwist: "Churros are really just fried dough and cinnamon sugar — puff pastry gets there in the oven instead of the fryer."
    }
  }
];

export function pickMockFusion({ spooky } = {}) {
  const pool = spooky ? MOCK_FUSIONS.filter((f) => f.tags?.includes("spooky")) : MOCK_FUSIONS;
  const source = pool.length > 0 ? pool : MOCK_FUSIONS;
  const pick = source[Math.floor(Math.random() * source.length)];
  return structuredClone(pick);
}
