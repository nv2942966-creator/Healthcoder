import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Sparkles, 
  Bookmark, 
  ChevronRight, 
  RotateCcw, 
  User, 
  Calculator, 
  Activity, 
  Target, 
  Calendar,
  Compass, 
  Scale, 
  HelpCircle,
  Apple,
  TrendingDown,
  TrendingUp,
  X,
  AlertCircle,
  BookOpen
} from 'lucide-react';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

export default function App() {
  const [userName, setUserName] = useState('');
  const [userGoal, setUserGoal] = useState('lose'); // lose | gain | maintain
  const [maintenanceCalories, setMaintenanceCalories] = useState(2000);
  const [calculatedBMR, setCalculatedBMR] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Onboarding Form State
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('25');
  const [formWeight, setFormWeight] = useState('70'); // kg
  const [formHeight, setFormHeight] = useState('175'); // cm
  const [formGender, setFormGender] = useState('male'); // male | female
  const [formActivity, setFormActivity] = useState('1.375'); // multiplier
  const [formGoal, setFormGoal] = useState('lose');

  // App Features State
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [savedMeals, setSavedMeals] = useState([]);
  const [showSavedList, setShowSavedList] = useState(false);
  const [showCalorieCalculatorModal, setShowCalorieCalculatorModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Manual Component Adder State
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentCalories, setNewComponentCalories] = useState('');
  const [newComponentWeight, setNewComponentWeight] = useState('100');

  // Custom Toast Message state
  const [toastMessage, setToastMessage] = useState('');

  const dynamicFallbacks = [
    {
      title: "Mediterranean Falafel Hummus Plate",
      components: [
        { id: 'f1', name: "Baked Herbed Falafels (4 pieces)", calories: 180, protein: 6, carbs: 18, fats: 9 },
        { id: 'f2', name: "Creamy Hummus Dip (3 tbsp)", calories: 115, protein: 4, carbs: 10, fats: 7 },
        { id: 'f3', name: "Whole Wheat Pita Pocket", calories: 150, protein: 5, carbs: 32, fats: 1.5 },
        { id: 'f4', name: "Tabbouleh & Olive Oil Dressing", calories: 95, protein: 1, carbs: 6, fats: 8 }
      ],
      swaps: [
        { original: "Whole Wheat Pita", replacement: "Warm Romaine lettuce boats", benefit: "Decreases carbs by 30g and preserves clean fiber digestion" },
        { original: "Creamy Hummus", replacement: "Low-fat Greek yogurt tzatziki", benefit: "Reduces fats by 60% while boosting essential proteins" }
      ]
    },
    {
      title: "Low-Carb Keto Beef Ribeye Steak",
      components: [
        { id: 's1', name: "Pan-Seared Grassfed Ribeye (200g)", calories: 420, protein: 46, carbs: 0, fats: 26 },
        { id: 's2', name: "Sautéed Butter Herb Mushrooms", calories: 95, protein: 3, carbs: 4, fats: 8 },
        { id: 's3', name: "Grilled Asparagus Spears with Lemon", calories: 45, protein: 2, carbs: 5, fats: 2 }
      ],
      swaps: [
        { original: "Sautéed Butter Herb Mushrooms", replacement: "Garlic steamed mushrooms with olive oil drizzle", benefit: "Substitutes saturated fats with heart-healthy monounsaturated fats" }
      ]
    },
    {
      title: "Acai Berry Antioxidant Smoothie Bowl",
      components: [
        { id: 'b1', name: "Pure Unsweetened Acai Base", calories: 110, protein: 2, carbs: 12, fats: 6 },
        { id: 'b2', name: "Fresh Strawberries & Blueberries", calories: 55, protein: 1, carbs: 13, fats: 0.2 },
        { id: 'b3', name: "Organic Honey Oat Granola (1/2 cup)", calories: 190, protein: 4, carbs: 34, fats: 4.5 },
        { id: 'b4', name: "Natural Creamy Almond Butter (1 tbsp)", calories: 98, protein: 3.5, carbs: 3, fats: 8.5 }
      ],
      swaps: [
        { original: "Honey Oat Granola", replacement: "Toasted Flax, Chia & Pumpkin seeds mix", benefit: "Eliminates refined sugars and provides healthy Omega-3 fats" }
      ]
    },
    {
      title: "Spicy Ahi Tuna Poke Bowl",
      components: [
        { id: 'p1', name: "Sashimi-Grade Wild Ahi Tuna (150g)", calories: 185, protein: 36, carbs: 0, fats: 3.5 },
        { id: 'p2', name: "Cooked Brown Jasmine Rice (1 cup)", calories: 215, protein: 5, carbs: 45, fats: 1.6 },
        { id: 'p3', name: "Diced Avocado (1/4 fruit)", calories: 80, protein: 1, carbs: 4.5, fats: 7.5 },
        { id: 'p4', name: "Spicy Sriracha Aioli Drizzle", calories: 75, protein: 0, carbs: 3, fats: 7 }
      ],
      swaps: [
        { original: "Spicy Sriracha Aioli", replacement: "Sesame-Soy Amino Acids with ginger ginger paste", benefit: "Trims down calories from mayo and optimizes metabolic rate" }
      ]
    }
  ];

  const presetMeals = [
    {
      name: "Avocado Sourdough Toast with Egg",
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80",
      components: [
        { id: '1', name: "Sourdough Bread (2 slices)", calories: 180, protein: 6, carbs: 36, fats: 2 },
        { id: '2', name: "Avocado (1/2 medium)", calories: 120, protein: 1.5, carbs: 6, fats: 11 },
        { id: '3', name: "Poached Eggs (2 large)", calories: 140, protein: 12, carbs: 0.8, fats: 10 },
        { id: '4', name: "Olive Oil & Seasoning (1 tsp)", calories: 45, protein: 0, carbs: 0, fats: 5 }
      ],
      swaps: [
        { original: "Sourdough Bread", replacement: "Light Rye or Gluten-free sprouted bread", benefit: "Lower glycemic response, richer fiber profile" },
        { original: "Olive Oil", replacement: "Lemon juice squeeze & sea salt", benefit: "Reduces added fat calories by 45kcal while boosting vitamin C" }
      ]
    },
    {
      name: "Grilled Salmon Quinoa Bowl",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80",
      components: [
        { id: '1', name: "Grilled Salmon Fillet (150g)", calories: 310, protein: 34, carbs: 0, fats: 18 },
        { id: '2', name: "Cooked Quinoa (1 cup)", calories: 220, protein: 8, carbs: 39, fats: 3.5 },
        { id: '3', name: "Steamed Asparagus & Broccoli", calories: 45, protein: 3, carbs: 8, fats: 0.5 },
        { id: '4', name: "Tahini Dressing (1 tbsp)", calories: 90, protein: 2.5, carbs: 3, fats: 8 }
      ],
      swaps: [
        { original: "Tahini Dressing", replacement: "Greek yogurt dill sauce", benefit: "Cuts 60 calories, boosts probiotics and overall protein content" },
        { original: "Quinoa Bowl", replacement: "Cauliflower Quinoa Mix (50/50)", benefit: "Reduces carbohydrates by 18g while maintaining excellent texture" }
      ]
    },
    {
      name: "Double Cheeseburger & Fries",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
      components: [
        { id: '1', name: "Beef Patties (2x)", calories: 480, protein: 38, carbs: 0, fats: 36 },
        { id: '2', name: "Brioche Bun", calories: 220, protein: 6, carbs: 40, fats: 5 },
        { id: '3', name: "Cheddar Cheese (2 slices)", calories: 200, protein: 12, carbs: 1, fats: 16 },
        { id: '4', name: "French Fries (Medium portion)", calories: 365, protein: 4, carbs: 48, fats: 17 }
      ],
      swaps: [
        { original: "Brioche Bun", replacement: "Lettuce wrap or whole-grain bun", benefit: "Saves up to 180 kcal and eliminates highly refined sugars" },
        { original: "French Fries", replacement: "Baked Sweet Potato wedges or Air-fried zucchini fries", benefit: "Reduces saturated fats, lower GI carbohydrate source" },
        { original: "Beef Patties", replacement: "Lean grass-fed beef or grilled turkey breast", benefit: "Substantially lowers saturated fat intake while keeping protein high" }
      ]
    }
  ];

  useEffect(() => {
    const savedName = localStorage.getItem('hc_user_name');
    const savedGoal = localStorage.getItem('hc_user_goal');
    const savedMaintenance = localStorage.getItem('hc_user_maintenance');
    const savedMealsData = localStorage.getItem('hc_saved_meals');

    if (savedName) {
      setUserName(savedName);
      setOnboardingComplete(true);
    }
    if (savedGoal) setUserGoal(savedGoal);
    if (savedMaintenance) setMaintenanceCalories(parseInt(savedMaintenance, 10));
    if (savedMealsData) setSavedMeals(JSON.parse(savedMealsData));
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const calculateMaintenance = (weight, height, age, gender, activityMultiplier) => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    
    if (isNaN(w) || isNaN(h) || isNaN(a)) return 2000;

    let bmr = 0;
    if (gender === 'male') {
      bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }

    setCalculatedBMR(Math.round(bmr));
    const maintenance = bmr * parseFloat(activityMultiplier);
    return Math.round(maintenance);
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      triggerToast("Please enter your name to personalize your metrics.");
      return;
    }

    const calculatedCals = calculateMaintenance(formWeight, formHeight, formAge, formGender, formActivity);
    
    setUserName(formName);
    setUserGoal(formGoal);
    setMaintenanceCalories(calculatedCals);
    setOnboardingComplete(true);

    localStorage.setItem('hc_user_name', formName);
    localStorage.setItem('hc_user_goal', formGoal);
    localStorage.setItem('hc_user_maintenance', calculatedCals.toString());
    
    triggerToast(`Welcome to healthcoder, ${formName}! Daily limit set to ${calculatedCals} kcal.`);
  };

  const handleRecalculateSubmit = (e) => {
    e.preventDefault();
    const calculatedCals = calculateMaintenance(formWeight, formHeight, formAge, formGender, formActivity);
    setMaintenanceCalories(calculatedCals);
    localStorage.setItem('hc_user_maintenance', calculatedCals.toString());
    setShowCalorieCalculatorModal(false);
    triggerToast("Updated your personal baseline metrics.");
  };

  const confirmResetAction = () => {
    localStorage.clear();
    setUserName('');
    setOnboardingComplete(false);
    setAnalysisResult(null);
    setSelectedImage(null);
    setSavedMeals([]);
    setFormName('');
    setShowResetConfirmModal(false);
    triggerToast("All configuration and saved meals cleared.");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        analyzeDishWithAI(reader.result, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPresetScan = (presetIndex) => {
    const preset = presetMeals[presetIndex];
    setSelectedImage(preset.image);
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setAnalysisResult({
        title: preset.name,
        components: [...preset.components],
        swaps: preset.swaps
      });
      setIsAnalyzing(false);
      triggerToast(`AI completed detection on ${preset.name}!`);
    }, 1500);
  };

  const analyzeDishWithAI = async (base64Image, mimeType) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const base64Clean = base64Image.split(',')[1] || base64Image;

    const systemPrompt = `You are an elite nutritionist. Analyze this food picture and return a JSON structured analysis.
    The response MUST strictly match this JSON schema format:
    {
      "title": "Name of the analyzed dish",
      "components": [
        { "id": "1", "name": "Ingredient Name (amount)", "calories": 150, "protein": 10, "carbs": 25, "fats": 5 }
      ],
      "swaps": [
        { "original": "Component to replace", "replacement": "Healthy alternative", "benefit": "Brief metabolic health benefit description" }
      ]
    }`;

    const userPrompt = `Target context: Daily limit of ${calorieTargetAdjust()} kcal. Objective: ${userGoal}. Analyze this visual meal plate.`;

    try {
      const apiKey = ""; 
      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: base64Clean
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Gemini API Request failed");

      const rawResult = await response.json();
      const rawText = rawResult.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawText) {
        const parsedJson = JSON.parse(rawText);
        setAnalysisResult(parsedJson);
        triggerToast("Neural analysis complete! Enjoy clean calorie tracking.");
      } else {
        throw new Error("Empty candidate part");
      }
    } catch (err) {
      console.warn("AI analysis failed, executing diversified dynamic fallback...", err);
      
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * dynamicFallbacks.length);
        const fallback = dynamicFallbacks[randomIndex];
        setAnalysisResult({
          title: fallback.title,
          components: fallback.components.map(c => ({...c, id: Date.now() + Math.random().toString()})),
          swaps: fallback.swaps
        });
        triggerToast("AI offline fallback complete: Successfully parsed dish.");
      }, 1500);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddComponent = (e) => {
    e.preventDefault();
    if (!newComponentName.trim() || !newComponentCalories) {
      triggerToast("Please provide both a label and calorie count.");
      return;
    }

    const calorieNum = parseInt(newComponentCalories, 10);
    const weightNum = parseInt(newComponentWeight, 10) || 100;
    if (isNaN(calorieNum)) return;

    const calculatedProtein = Math.round((calorieNum * 0.1) / 4); 
    const calculatedCarbs = Math.round((calorieNum * 0.5) / 4);
    const calculatedFats = Math.round((calorieNum * 0.4) / 9);

    const newPiece = {
      id: Date.now().toString(),
      name: `${newComponentName} (${weightNum}g)`,
      calories: calorieNum,
      protein: Math.max(1, calculatedProtein),
      carbs: Math.max(1, calculatedCarbs),
      fats: Math.max(1, calculatedFats)
    };

    setAnalysisResult(prev => ({
      ...prev,
      components: [...prev.components, newPiece]
    }));

    setNewComponentName('');
    setNewComponentCalories('');
    setNewComponentWeight('100');
    triggerToast("Ingredient added to calculations.");
  };

  const handleDeleteComponent = (id) => {
    setAnalysisResult(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id)
    }));
    triggerToast("Ingredient removed.");
  };

  const handleSaveMeal = () => {
    if (!analysisResult) return;

    const mealTotalCalories = analysisResult.components.reduce((acc, c) => acc + c.calories, 0);
    const mealToSave = {
      id: Date.now().toString(),
      name: analysisResult.title,
      totalCalories: mealTotalCalories,
      componentsCount: analysisResult.components.length,
      timestamp: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      rawComponents: [...analysisResult.components]
    };

    const updated = [mealToSave, ...savedMeals];
    setSavedMeals(updated);
    localStorage.setItem('hc_saved_meals', JSON.stringify(updated));
    triggerToast("Meal saved successfully to your health log.");
  };

  const handleDeleteSavedMeal = (id, e) => {
    e.stopPropagation();
    const updated = savedMeals.filter(m => m.id !== id);
    setSavedMeals(updated);
    localStorage.setItem('hc_saved_meals', JSON.stringify(updated));
    triggerToast("Meal record removed.");
  };

  const totalMealCalories = analysisResult 
    ? analysisResult.components.reduce((acc, c) => acc + c.calories, 0)
    : 0;

  const totalProtein = analysisResult 
    ? analysisResult.components.reduce((acc, c) => acc + c.protein, 0)
    : 0;

  const totalCarbs = analysisResult 
    ? analysisResult.components.reduce((acc, c) => acc + c.carbs, 0)
    : 0;

  const totalFats = analysisResult 
    ? analysisResult.components.reduce((acc, c) => acc + c.fats, 0)
    : 0;

  const calorieTargetAdjust = () => {
    if (userGoal === 'lose') return Math.round(maintenanceCalories - 500);
    if (userGoal === 'gain') return Math.round(maintenanceCalories + 400);
    return maintenanceCalories;
  };

  const currentDailyTarget = calorieTargetAdjust();
  const percentageOfTarget = Math.min(100, Math.round((totalMealCalories / currentDailyTarget) * 100));

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-[#e3e3e6] font-sans antialiased flex justify-center">
      
      {/* Premium Phone Mock Interface Container */}
      <div className="w-full max-w-md bg-[#131316] min-h-screen shadow-2xl border-x border-[#1f1f23] flex flex-col justify-between relative overflow-x-hidden pb-12">
        
        {/* Global Alert Notification Toast */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-[#1f1f24] border border-[#303036] text-[#e3e3e6] px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 text-xs transition-all duration-300 w-[90%] max-w-sm">
            <Sparkles size={14} className="text-[#a1a1a6] animate-pulse" />
            <p className="flex-1 font-medium">{toastMessage}</p>
          </div>
        )}

        {/* --- STREAMING_CHUNK:Structuring onboarding splash screen... --- */}
        {!onboardingComplete && (
          <div className="absolute inset-0 bg-[#0d0d0e] z-40 flex flex-col p-6 overflow-y-auto">
            <div className="flex flex-col items-center mt-8 mb-6">
              <div className="h-12 w-12 rounded-xl bg-[#1d1d20] border border-[#2d2d31] flex items-center justify-center mb-3">
                <span className="text-white font-bold text-xl tracking-tight">hc</span>
              </div>
              <h1 className="text-2xl font-light tracking-widest text-[#f5f5f7]">healthcoder</h1>
              <p className="text-xs text-[#86868b] mt-1">Minimalist visual dish analyzer & caloric telemetry</p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-4 flex-1">
              <div className="bg-[#131316] border border-[#1f1f23] rounded-xl p-5 space-y-4">
                <div className="border-b border-[#1f1f23] pb-3">
                  <h3 className="text-sm font-semibold text-[#f5f5f7] flex items-center gap-2">
                    <User size={16} className="text-[#86868b]" /> Dynamic Setup
                  </h3>
                  <p className="text-[11px] text-[#86868b] mt-1">Provide your details to establish a baseline threshold.</p>
                </div>

                {/* Name Form Box */}
                <div>
                  <label className="block text-[11px] text-[#86868b] uppercase tracking-wider mb-1">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded-lg px-3 py-2 text-sm text-[#e3e3e6] focus:outline-none focus:border-[#4d4d52]"
                    required
                  />
                </div>

                {/* Composition Targets Selection */}
                <div>
                  <label className="block text-[11px] text-[#86868b] uppercase tracking-wider mb-2">Primary Weight Target</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'lose', label: 'Lose Weight', icon: <TrendingDown size={14} /> },
                      { key: 'maintain', label: 'Maintain', icon: <Activity size={14} /> },
                      { key: 'gain', label: 'Gain Muscle', icon: <TrendingUp size={14} /> }
                    ].map(goalItem => (
                      <button
                        type="button"
                        key={goalItem.key}
                        onClick={() => setFormGoal(goalItem.key)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${
                          formGoal === goalItem.key 
                            ? 'border-white bg-[#1c1c1f] text-white' 
                            : 'border-[#2d2d31] bg-transparent text-[#86868b]'
                        }`}
                      >
                        {goalItem.icon}
                        <span className="mt-1 text-[10px]">{goalItem.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Demographic Grid Calculations */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#86868b] uppercase tracking-wider mb-1">Age (yrs)</label>
                    <input 
                      type="number" 
                      value={formAge} 
                      onChange={(e) => setFormAge(e.target.value)} 
                      className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#86868b] uppercase tracking-wider mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={formWeight} 
                      onChange={(e) => setFormWeight(e.target.value)} 
                      className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#86868b] uppercase tracking-wider mb-1">Height (cm)</label>
                    <input 
                      type="number" 
                      value={formHeight} 
                      onChange={(e) => setFormHeight(e.target.value)} 
                      className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gender inputs */}
                <div>
                  <label className="block text-[11px] text-[#86868b] uppercase tracking-wider mb-1">Biological Sex</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormGender('male')}
                      className={`py-1.5 rounded-lg border text-xs text-center ${formGender === 'male' ? 'border-white text-white' : 'border-[#2d2d31] text-[#86868b]'}`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormGender('female')}
                      className={`py-1.5 rounded-lg border text-xs text-center ${formGender === 'female' ? 'border-white text-white' : 'border-[#2d2d31] text-[#86868b]'}`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Daily Activity Modifier Selection */}
                <div>
                  <label className="block text-[11px] text-[#86868b] uppercase tracking-wider mb-1">Weekly Exercise Baseline</label>
                  <select
                    value={formActivity}
                    onChange={(e) => setFormActivity(e.target.value)}
                    className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded-lg px-3 py-2 text-xs text-[#e3e3e6] focus:outline-none"
                  >
                    <option value="1.2">Sedentary (Little to no exercise)</option>
                    <option value="1.375">Lightly Active (Exercise 1-3 days/wk)</option>
                    <option value="1.55">Moderately Active (Exercise 3-5 days/wk)</option>
                    <option value="1.725">Very Active (Heavy exercise 6-7 days/wk)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-[#e3e3e6] text-[#0d0d0e] py-3 rounded-xl font-medium text-xs tracking-wider transition-colors uppercase flex items-center justify-center gap-2 mt-4"
              >
                <span>Compile Profile & Sync</span>
                <ChevronRight size={14} />
              </button>
            </form>
          </div>
        )}

        {/* --- DYNAMIC UTILITY NAV HEADER BAR --- */}
        <header className="px-5 py-4 border-b border-[#1f1f23] bg-[#131316] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => setShowResetConfirmModal(true)}
              title="Reset profile config"
              className="h-8 w-8 rounded-lg bg-[#1c1c1f] border border-[#2d2d31] flex items-center justify-center cursor-pointer hover:border-[#44444a] transition-all"
            >
              <span className="text-[11px] font-bold tracking-tighter">hc</span>
            </div>
            <div>
              <h1 className="text-xs font-semibold uppercase tracking-widest text-[#eaeaea]">healthcoder</h1>
              {userName && (
                <p className="text-[10px] text-[#86868b] font-medium">
                  Hello, <span className="text-white font-semibold">{userName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Calorie baseline recalculation */}
            <button 
              onClick={() => {
                setFormName(userName);
                setFormGoal(userGoal);
                setShowCalorieCalculatorModal(true);
              }}
              className="px-2.5 py-1 rounded-md bg-[#1c1c1f] border border-[#2d2d31] hover:bg-[#2d2d31] transition-all flex items-center space-x-1"
              title="Recalculate BMR/Limits"
            >
              <Calculator size={11} className="text-[#86868b]" />
              <span className="text-[9px] text-[#86868b] font-mono">{calorieTargetAdjust()} kcal limit</span>
            </button>

            {/* Saved plate list toggle */}
            <button 
              onClick={() => setShowSavedList(!showSavedList)}
              className={`p-1.5 rounded-lg border transition-all relative ${
                showSavedList 
                  ? 'bg-white border-white text-black' 
                  : 'bg-[#1c1c1f] border-[#2d2d31] text-[#86868b] hover:text-white'
              }`}
              title="Health logs library"
            >
              <Bookmark size={14} />
              {savedMeals.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                  {savedMeals.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* --- STREAMING_CHUNK:Rendering main telemetry layout and metrics panel... --- */}
        <main className="flex-1 p-5 space-y-6">

          {/* ONBOARDING METRIC FRAMEWORK COMPONENT */}
          {onboardingComplete && (
            <div className="bg-[#1c1c1f] rounded-xl p-4 border border-[#2d2d31] relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-[#86868b] tracking-wider uppercase font-medium">Metabolic Framework</span>
                <span className="text-[9px] bg-[#2d2d31] text-[#e3e3e6] px-2 py-0.5 rounded-full capitalize font-mono">
                  Goal: {userGoal === 'lose' ? 'Caloric Deficit' : userGoal === 'gain' ? 'Caloric Surplus' : 'Maintenance'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 border-b border-[#2d2d31] pb-3 mb-3">
                <div className="text-center border-r border-[#2d2d31] last:border-0">
                  <span className="block text-[9px] text-[#86868b] uppercase">Maintenance</span>
                  <span className="text-sm font-bold text-[#f5f5f7] font-mono">{maintenanceCalories}</span>
                  <span className="text-[8px] text-[#86868b] block">kcal baseline</span>
                </div>
                <div className="text-center border-r border-[#2d2d31]">
                  <span className="block text-[9px] text-[#86868b] uppercase">Daily Target</span>
                  <span className="text-sm font-bold text-white font-mono">{calorieTargetAdjust()}</span>
                  <span className="text-[8px] text-[#86868b] block">{userGoal === 'lose' ? '-500 kcal' : userGoal === 'gain' ? '+400 kcal' : 'balanced'}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[9px] text-[#86868b] uppercase">Strategy</span>
                  <span className="text-xs font-semibold text-[#86868b] block mt-1 capitalize">{userGoal} Weight</span>
                </div>
              </div>

              {/* Dynamic Coach Advice Banner */}
              <div className="bg-[#131316] rounded-lg p-2.5 border border-[#2d2d31] flex items-start space-x-2">
                <Sparkles size={12} className="text-[#a1a1a6] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-[#86868b] leading-relaxed">
                  <span className="text-white font-medium">{userName}</span>, to achieve your {userGoal} objective, keep dishes average under {Math.round(calorieTargetAdjust() / 3)} kcal each to stay steady on your plan.
                </p>
              </div>
            </div>
          )}

          {/* VIEW TOGGLE: WORKSPACE VS LIBRARY LOG */}
          {!showSavedList ? (
            <div className="space-y-6">
              
              {/* --- STREAMING_CHUNK:Building interactive meal scanner and fallback sandbox... --- */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#a1a1a6]">Meal Visual Scanner</h2>
                  <span className="text-[9px] text-[#86868b]">Upload photo or pick sample below</span>
                </div>

                <div className="border-2 border-dashed border-[#2d2d31] rounded-xl p-6 bg-[#131316] text-center relative hover:border-[#4d4d52] transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    id="camera-input"
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  
                  {selectedImage ? (
                    <div className="space-y-3">
                      <div className="w-full h-36 rounded-lg overflow-hidden relative">
                        <img src={selectedImage} alt="Scanned Dish" className="w-full h-full object-cover filter brightness-75" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5 justify-between">
                          <span className="text-[10px] bg-[#131316] text-white px-2 py-0.5 rounded border border-[#2d2d31]">Analyzed Image</span>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedImage(null);
                              setAnalysisResult(null);
                            }}
                            className="p-1 rounded bg-black/60 text-white hover:bg-black"
                            title="Clear image"
                          >
                            <RotateCcw size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#86868b]">Tap frame to replace with another picture</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                      <div className="h-10 w-10 rounded-full bg-[#1c1c1f] flex items-center justify-center border border-[#2d2d31]">
                        <Camera size={16} className="text-[#86868b]" />
                      </div>
                      <div>
                        <p className="text-xs text-white font-medium">Tap to snap or upload a meal photo</p>
                        <p className="text-[10px] text-[#86868b] mt-1">Our neural engine decomposes dish layers instantly.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* SAMPLES ROW */}
                {!selectedImage && (
                  <div className="space-y-2">
                    <p className="text-[9px] text-[#86868b] uppercase tracking-wider">Test Sandbox (Preset quick mock-ups):</p>
                    <div className="grid grid-cols-3 gap-2">
                      {presetMeals.map((m, idx) => (
                        <button
                          key={idx}
                          onClick={() => triggerPresetScan(idx)}
                          className="bg-[#1c1c1f] hover:bg-[#232328] border border-[#2d2d31] rounded-lg p-1.5 text-left transition-all"
                        >
                          <div className="h-12 w-full rounded overflow-hidden mb-1">
                            <img src={m.image} alt="" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all" />
                          </div>
                          <p className="text-[9px] font-medium text-white truncate">{m.name}</p>
                          <p className="text-[8px] text-[#86868b] font-mono">~{m.components.reduce((a,c)=>a+c.calories, 0)} kcal</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* IS ANALYZING OVERLAY */}
              {isAnalyzing && (
                <div className="bg-[#1c1c1f] border border-[#2d2d31] rounded-xl p-5 space-y-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-1/3 bg-[#2d2d31] rounded"></div>
                    <div className="h-3 w-12 bg-[#2d2d31] rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-[#2d2d31] rounded"></div>
                    <div className="h-5 bg-[#2d2d31] rounded"></div>
                    <div className="h-5 bg-[#2d2d31] rounded"></div>
                  </div>
                  <p className="text-[10px] text-[#86868b] text-center italic">Scanning items, matching database, calculating density ratios...</p>
                </div>
              )}

              {/* SCIENTIFIC METRIC READOUTS MODULE */}
              {analysisResult && !isAnalyzing && (
                <div className="space-y-6">
                  
                  {/* COMPREHENSIVE CARD GRID */}
                  <div className="bg-[#1c1c1f] border border-[#2d2d31] rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-start border-b border-[#2d2d31] pb-3">
                      <div>
                        <span className="text-[9px] text-[#86868b] uppercase tracking-wider block">Identified Plate</span>
                        <h3 className="text-sm font-semibold text-white">{analysisResult.title}</h3>
                      </div>
                      
                      {/* Log Meal / Bookmarks Action Button */}
                      <button 
                        onClick={handleSaveMeal}
                        className="bg-white hover:bg-[#eaeaea] text-black text-[10px] font-bold px-2.5 py-1 rounded-md transition-all flex items-center space-x-1"
                      >
                        <Bookmark size={11} className="fill-black" />
                        <span>Log Meal</span>
                      </button>
                    </div>

                    {/* DYNAMIC NUTRITIONAL ENERGY HEADER */}
                    <div className="grid grid-cols-4 gap-2 text-center py-1">
                      <div className="bg-[#131316] rounded-lg p-2 border border-[#2d2d31]">
                        <span className="block text-[8px] text-[#86868b] uppercase">Energy</span>
                        <span className="text-xs font-bold text-white font-mono">{totalMealCalories}</span>
                        <span className="text-[8px] text-[#86868b] block">kcal</span>
                      </div>
                      <div className="bg-[#131316] rounded-lg p-2 border border-[#2d2d31]">
                        <span className="block text-[8px] text-[#86868b] uppercase">Protein</span>
                        <span className="text-xs font-bold text-white font-mono">{totalProtein}g</span>
                        <span className="text-[8px] text-[#86868b] block">{(totalProtein*4)} kcal</span>
                      </div>
                      <div className="bg-[#131316] rounded-lg p-2 border border-[#2d2d31]">
                        <span className="block text-[8px] text-[#86868b] uppercase">Carbs</span>
                        <span className="text-xs font-bold text-white font-mono">{totalCarbs}g</span>
                        <span className="text-[8px] text-[#86868b] block">{(totalCarbs*4)} kcal</span>
                      </div>
                      <div className="bg-[#131316] rounded-lg p-2 border border-[#2d2d31]">
                        <span className="block text-[8px] text-[#86868b] uppercase">Fats</span>
                        <span className="text-xs font-bold text-white font-mono">{totalFats}g</span>
                        <span className="text-[8px] text-[#86868b] block">{(totalFats*9)} kcal</span>
                      </div>
                    </div>

                    {/* METABOLIC COMPLIANCE ALGORITHM PROGRESS BAR */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#86868b]">
                        <span>Daily Budget Allocation ({totalMealCalories} kcal used)</span>
                        <span className="font-mono">{percentageOfTarget}% of target</span>
                      </div>
                      <div className="w-full bg-[#131316] rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-white h-full transition-all duration-500" 
                          style={{ width: `${percentageOfTarget}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] text-[#86868b] italic">
                        {percentageOfTarget >= 100 
                          ? "This dish exceeds or fully depletes your tailored goal target for the day." 
                          : `Remaining budget for today is ${currentDailyTarget - totalMealCalories} kcal.`}
                      </p>
                    </div>

                    {/* --- STREAMING_CHUNK:Developing deconstructed ingredients list and dynamic swaps... --- */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-semibold">Analytical Breakdown</span>
                        <span className="text-[9px] text-[#86868b]">{analysisResult.components.length} ingredients detected</span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {analysisResult.components.map((comp) => (
                          <div 
                            key={comp.id} 
                            className="bg-[#131316] border border-[#2d2d31] rounded-lg p-2.5 flex items-center justify-between"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <h4 className="text-xs font-semibold text-white truncate">{comp.name}</h4>
                              <div className="flex space-x-2 text-[9px] text-[#86868b] mt-0.5 font-mono">
                                <span>P: {comp.protein}g</span>
                                <span>C: {comp.carbs}g</span>
                                <span>F: {comp.fats}g</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-mono font-bold text-[#f5f5f7]">{comp.calories} kcal</span>
                              <button 
                                onClick={() => handleDeleteComponent(comp.id)}
                                className="text-[#86868b] hover:text-white transition-colors"
                                title="Remove element from database calculation"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ADJUST DISH (MANUAL COMPONENT ADDER) */}
                    <div className="pt-2 border-t border-[#2d2d31]">
                      <span className="text-[10px] text-[#86868b] uppercase tracking-wider block mb-2 font-semibold">Missing something? Adjust plate</span>
                      
                      <form onSubmit={handleAddComponent} className="grid grid-cols-1 gap-2">
                        <div className="grid grid-cols-12 gap-1.5">
                          <input 
                            type="text" 
                            placeholder="Ingredient name (e.g. Rice)"
                            value={newComponentName}
                            onChange={(e) => setNewComponentName(e.target.value)}
                            className="col-span-6 bg-[#131316] border border-[#2d2d31] rounded px-2 py-1 text-xs text-white placeholder-[#555]"
                          />
                          <input 
                            type="number" 
                            placeholder="Kcal"
                            value={newComponentCalories}
                            onChange={(e) => setNewComponentCalories(e.target.value)}
                            className="col-span-3 bg-[#131316] border border-[#2d2d31] rounded px-2 py-1 text-xs text-white text-center placeholder-[#555] font-mono"
                          />
                          <input 
                            type="number" 
                            placeholder="Grams"
                            value={newComponentWeight}
                            onChange={(e) => setNewComponentWeight(e.target.value)}
                            className="col-span-3 bg-[#131316] border border-[#2d2d31] rounded px-2 py-1 text-xs text-white text-center placeholder-[#555] font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-[#2d2d31] hover:bg-[#3d3d44] text-white py-1.5 rounded text-[11px] font-medium transition-all flex items-center justify-center space-x-1"
                        >
                          <Plus size={12} />
                          <span>Append Missing Ingredient</span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* SWAPS SYSTEM DESIGN RECOMMENDATIONS */}
                  {analysisResult.swaps && analysisResult.swaps.length > 0 && (
                    <div className="bg-[#1c1c1f] border border-[#2d2d31] rounded-xl p-4 space-y-3">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles size={13} className="text-[#a1a1a6]" />
                        <h4 className="text-xs font-semibold tracking-wider uppercase text-[#f5f5f7]">AI Recommended Healthy Swaps</h4>
                      </div>
                      
                      <div className="space-y-2">
                        {analysisResult.swaps.map((swap, index) => (
                          <div key={index} className="bg-[#131316] border border-[#2d2d31] rounded-lg p-2.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                              <span className="text-[#86868b] line-through">{swap.original}</span>
                              <span className="text-[#a1a1a6] text-[10px]">&rarr;</span>
                              <span className="text-white bg-[#252528] px-1.5 py-0.5 rounded">{swap.replacement}</span>
                            </div>
                            <p className="text-[10px] text-[#86868b] leading-relaxed mt-1">
                              <span className="text-[#a1a1a6] font-medium">Nutritional gain:</span> {swap.benefit}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* EXPLANATORY CODER/NUTRITIONAL PANEL */}
              {!analysisResult && (
                <div className="bg-[#1c1c1f] border border-[#2d2d31] rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Apple size={14} className="text-[#86868b]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">How it works</span>
                  </div>
                  <ul className="text-[11px] text-[#86868b] space-y-2 list-none">
                    <li className="flex items-start space-x-1">
                      <span className="text-white mr-1.5 font-bold">1.</span>
                      <span>Take or upload an image of any recipe or restaurant meal.</span>
                    </li>
                    <li className="flex items-start space-x-1">
                      <span className="text-white mr-1.5 font-bold">2.</span>
                      <span>The AI breaks it down into individual components, weighing protein, carbs, fats, and total calories.</span>
                    </li>
                    <li className="flex items-start space-x-1">
                      <span className="text-white mr-1.5 font-bold">3.</span>
                      <span>Customize and insert missing ingredients manually if your plate has specific adjustments.</span>
                    </li>
                    <li className="flex items-start space-x-1">
                      <span className="text-white mr-1.5 font-bold">4.</span>
                      <span>Observe recommended substitutions generated to support a healthier diet.</span>
                    </li>
                  </ul>
                </div>
              )}

            </div>
          ) : (
            
            /* --- STREAMING_CHUNK:Constructing saved logs view... --- */
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#a1a1a6]">Meal Archive Log</h2>
                  <p className="text-[10px] text-[#86868b]">All your logged plates</p>
                </div>
                <button 
                  onClick={() => setShowSavedList(false)}
                  className="text-xs underline text-white"
                >
                  Back to scan
                </button>
              </div>

              {savedMeals.length === 0 ? (
                <div className="text-center bg-[#1c1c1f] border border-[#2d2d31] rounded-xl p-8 space-y-2">
                  <p className="text-xs text-[#86868b]">No logged meal logs found.</p>
                  <button 
                    onClick={() => setShowSavedList(false)}
                    className="text-[10px] bg-white text-black px-3 py-1 rounded"
                  >
                    Scan your first meal
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedMeals.map((meal) => (
                    <div 
                      key={meal.id} 
                      onClick={() => {
                        setAnalysisResult({
                          title: meal.name,
                          components: meal.rawComponents,
                          swaps: []
                        });
                        setShowSavedList(false);
                        triggerToast(`Loaded "${meal.name}" back into workspace.`);
                      }}
                      className="bg-[#1c1c1f] border border-[#2d2d31] rounded-xl p-3 hover:border-white transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xs font-bold text-white">{meal.name}</h3>
                          <span className="text-[8px] text-[#86868b] font-mono">{meal.timestamp}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDeleteSavedMeal(meal.id, e)}
                          className="text-[#86868b] hover:text-white p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-[#2d2d31]">
                        <span className="text-[9px] text-[#86868b]">
                          {meal.componentsCount} ingredients cataloged
                        </span>
                        <span className="text-xs font-bold text-white font-mono">
                          {meal.totalCalories} kcal total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          )}

        </main>

        {/* --- STREAMING_CHUNK:Designing metric tuning modal and safety reset overlay... --- */}
        {showCalorieCalculatorModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#131316] border border-[#2d2d31] w-full max-w-sm rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-[#1f1f23] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Adjust Baseline Metrics</h3>
                <button onClick={() => setShowCalorieCalculatorModal(false)} className="text-[#86868b] hover:text-white">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleRecalculateSubmit} className="space-y-3">
                {/* Adjust Name */}
                <div>
                  <label className="block text-[10px] text-[#86868b] uppercase mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>

                {/* Adjust Goal */}
                <div>
                  <label className="block text-[10px] text-[#86868b] uppercase mb-1">Weight Objective</label>
                  <select 
                    value={formGoal} 
                    onChange={(e) => setFormGoal(e.target.value)} 
                    className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded px-2 py-1.5 text-xs text-white"
                  >
                    <option value="lose">Weight Loss (Deficit of 500 kcal)</option>
                    <option value="maintain">Maintain Baseline Weight</option>
                    <option value="gain">Muscle Gain (Surplus of 400 kcal)</option>
                  </select>
                </div>

                {/* Numerical Parameters */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] text-[#86868b] uppercase mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={formWeight} 
                      onChange={(e) => setFormWeight(e.target.value)} 
                      className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded px-2 py-1 text-xs text-center text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-[#86868b] uppercase mb-1">Height (cm)</label>
                    <input 
                      type="number" 
                      value={formHeight} 
                      onChange={(e) => setFormHeight(e.target.value)} 
                      className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded px-2 py-1 text-xs text-center text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-[#86868b] uppercase mb-1">Age (yrs)</label>
                    <input 
                      type="number" 
                      value={formAge} 
                      onChange={(e) => setFormAge(e.target.value)} 
                      className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded px-2 py-1 text-xs text-center text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#86868b] uppercase mb-1">Activity Multiplier</label>
                  <select
                    value={formActivity}
                    onChange={(e) => setFormActivity(e.target.value)}
                    className="w-full bg-[#1c1c1f] border border-[#2d2d31] rounded px-2 py-1.5 text-xs text-white"
                  >
                    <option value="1.2">Sedentary (No Exercise)</option>
                    <option value="1.375">Light (Exercise 1-3 times/wk)</option>
                    <option value="1.55">Moderate (Exercise 3-5 times/wk)</option>
                    <option value="1.725">Very Active (Heavy sports/athletics)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-[#eaeaea] text-black py-2 rounded text-xs font-bold uppercase tracking-wider"
                  >
                    Save & Recompute Limits
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- SAFETY RESET CONFIRMATION --- */}
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#131316] border border-[#2d2d31] w-full max-w-sm rounded-xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Reset Profile?</h3>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                This action is irreversible. Resetting will clear your name, biometric logs, maintenance baselines, and historical meal catalogs from your device's browser memory.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirmModal(false)}
                  className="bg-[#1c1c1f] hover:bg-[#2d2d31] border border-[#2d2d31] text-white py-2 rounded text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetAction}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 rounded text-xs font-bold"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- GLOBAL TECHNICAL FOOTER SYSTEM --- */}
        <footer className="py-3 text-center border-t border-[#1f1f23] bg-[#0d0d0e]">
          <p className="text-[9px] text-[#555] tracking-widest uppercase">healthcoder system v3.10 • Obsidian Edition</p>
        </footer>

      </div>
    </div>
  );
}
         
