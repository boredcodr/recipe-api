
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);


CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  ingredients TEXT NOT NULL, 
  instructions TEXT NOT NULL,
  category TEXT DEFAULT 'Uncategorized',
  added_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);


INSERT INTO users (email, password) VALUES
('chef.alice@example.com', '$2b$10$VhFjBvHzQhG7mN4b8J1kqe7bG5H6Z1C9aY8aH6Z1C9aY8aH6Z1C9a'), -- password: alicepassword
('chef.bob@example.com', '$2b$10$KjG7mN4b8J1kqe7bG5H6Z1C9aY8aH6Z1C9aY8aH6Z1C9aY8aH6Z1C9a');   -- password: bobpassword


INSERT INTO recipes (title, ingredients, instructions, category, added_by) VALUES
(
  'Spaghetti Carbonara',
  '["200g spaghetti", "100g pancetta", "2 large eggs", "50g Pecorino cheese", "50g Parmesan", "Black pepper", "Salt"]',
  '1. Cook spaghetti according to package instructions.\n2. In a pan, cook pancetta until crispy.\n3. Beat eggs in a bowl, then mix in cheeses.\n4. Combine spaghetti with pancetta and remove from heat.\n5. Quickly mix in egg and cheese mixture.\n6. Season with black pepper and serve immediately.',
  'Italian',
  (SELECT id FROM users WHERE email = 'chef.alice@example.com')
),
(
  'Chicken Tikka Masala',
  '["500g chicken breast", "200g yogurt", "2 tbsp lemon juice", "4 cloves garlic", "1 inch ginger", "2 tsp garam masala", "1 tsp turmeric", "1 tsp cumin", "400g canned tomatoes", "200ml cream", "Salt", "Oil"]',
  '1. Marinate chicken with yogurt, lemon juice, garlic, ginger, garam masala, turmeric, cumin, and salt for at least 1 hour.\n2. Grill or cook the chicken until done.\n3. In a pan, heat oil and sauté garlic and ginger.\n4. Add canned tomatoes and cook until thickened.\n5. Stir in cream and simmer.\n6. Add cooked chicken to the sauce and simmer for 10 minutes.\n7. Serve with rice or naan.',
  'Indian',
  (SELECT id FROM users WHERE email = 'chef.bob@example.com')
),
(
  'Avocado Toast',
  '["2 slices of bread", "1 ripe avocado", "Salt", "Pepper", "Lemon juice", "Chili flakes (optional)"]',
  '1. Toast the bread slices to your desired level.\n2. Mash the avocado in a bowl with salt, pepper, and a splash of lemon juice.\n3. Spread the mashed avocado evenly on the toasted bread.\n4. Sprinkle chili flakes on top if desired.\n5. Serve immediately.',
  'Breakfast',
  (SELECT id FROM users WHERE email = 'chef.alice@example.com')
),
(
  'Chocolate Chip Cookies',
  '["1 cup butter", "1 cup white sugar", "1 cup packed brown sugar", "2 eggs", "2 tsp vanilla extract", "3 cups all-purpose flour", "1 tsp baking soda", "2 tsp hot water", "0.5 tsp salt", "2 cups semisweet chocolate chips"]',
  '1. Preheat oven to 350°F (175°C).\n2. Cream together the butter and sugars until smooth.\n3. Beat in the eggs one at a time, then stir in the vanilla.\n4. Dissolve baking soda in hot water and add to batter along with salt.\n5. Stir in flour and chocolate chips.\n6. Drop by large spoonfuls onto ungreased pans.\n7. Bake for about 10 minutes, or until edges are nicely browned.',
  'Dessert',
  (SELECT id FROM users WHERE email = 'chef.bob@example.com')
);
