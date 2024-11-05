
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid access token' });
    req.user = user;
    next();
  });
};


app.post('/register', async (req, res) => {
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }


  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }


  const hashedPassword = await bcrypt.hash(password, 10);


  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password: hashedPassword }])
    .select('id, email');

  if (error) {
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }

  res.status(201).json({ message: 'User created successfully', user: data[0] });
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }


  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }


  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

  res.json({ message: 'Login successful', token });
});


app.get('/recipes', async (req, res) => {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, ingredients, instructions, category, added_by, created_at');

  if (error) {
    return res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }

  res.json(data);
});


app.get('/recipes/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, ingredients, instructions, category, added_by, created_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ message: 'Recipe not found', error: error ? error.message : 'No data' });
  }

  res.json(data);
});


app.post('/recipes', authenticateToken, async (req, res) => {
  const { title, ingredients, instructions, category } = req.body;


  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ message: 'Title, ingredients, and instructions are required' });
  }


  const { data, error } = await supabase
    .from('recipes')
    .insert([
      {
        title,
        ingredients,
        instructions,
        category: category || 'Uncategorized',
        added_by: req.user.id
      }
    ])
    .select('id, title, ingredients, instructions, category, added_by, created_at');

  if (error) {
    return res.status(500).json({ message: 'Error adding recipe', error: error.message });
  }

  res.status(201).json({ message: 'Recipe added successfully', recipe: data[0] });
});


app.put('/recipes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, ingredients, instructions, category } = req.body;


  const { data: existingRecipe, error: fetchError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingRecipe) {
    return res.status(404).json({ message: 'Recipe not found', error: fetchError ? fetchError.message : 'No data' });
  }

  if (existingRecipe.added_by !== req.user.id) {
    return res.status(403).json({ message: 'You are not authorized to update this recipe' });
  }


  const { data, error } = await supabase
    .from('recipes')
    .update({
      title: title || existingRecipe.title,
      ingredients: ingredients || existingRecipe.ingredients,
      instructions: instructions || existingRecipe.instructions,
      category: category || existingRecipe.category
    })
    .eq('id', id)
    .select('id, title, ingredients, instructions, category, added_by, created_at');

  if (error) {
    return res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }

  res.json({ message: 'Recipe updated successfully', recipe: data[0] });
});


app.delete('/recipes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;


  const { data: existingRecipe, error: fetchError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingRecipe) {
    return res.status(404).json({ message: 'Recipe not found', error: fetchError ? fetchError.message : 'No data' });
  }

  if (existingRecipe.added_by !== req.user.id) {
    return res.status(403).json({ message: 'You are not authorized to delete this recipe' });
  }


  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }

  res.json({ message: 'Recipe deleted successfully' });
});


app.listen(port, () => {
  console.log(`Recipe Generator API is running on port ${port}`);
});
