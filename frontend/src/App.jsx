import { useState, useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Heart, Award, Brain, Activity, Upload, Loader, LogOut, User, Dumbbell, TrendingUp, Footprints, Users, BarChart3, History } from 'lucide-react';
import { register, login, logMood, analyzeMedicalImage, generateWorkout, completeWorkout, logActivity, getActivityHistory, getMoodHistory, getMedicalHistory, submitQuiz } from './services/api';

// Login/Register Component
function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register(formData);

      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-3 rounded-xl">
            <Heart className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">GuardianChain</h1>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

// Main App Component
function MainApp() {
  const { user, logoutUser, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Medical State
  const [medicalPreview, setMedicalPreview] = useState(null);
  const [medicalResult, setMedicalResult] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);

  // Mood State
  const [moodText, setMoodText] = useState('');
  const [moodResult, setMoodResult] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);

  // Workout State
  const [workoutType, setWorkoutType] = useState('strength');
  const [generatedWorkout, setGeneratedWorkout] = useState(null);

  // Activity State
  const [steps, setSteps] = useState('');
  const [activityStats, setActivityStats] = useState(null);

  // Personality Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([50, 50, 50, 50]);
  const [quizResult, setQuizResult] = useState(null);

  const quizQuestions = [
    { question: "How do you recharge after a long day?", low: "Quiet time alone", high: "Being with friends" },
    { question: "In social situations, you prefer to:", low: "Listen and observe", high: "Lead conversations" },
    { question: "When planning, you are:", low: "Spontaneous and flexible", high: "Organized and structured" },
    { question: "You make decisions based on:", low: "Feelings and values", high: "Logic and analysis" }
  ];

  // Load data when switching tabs
  useEffect(() => {
    if (activeTab === 'analytics') loadMoodHistory();
    if (activeTab === 'activity') loadActivityHistory();
    if (activeTab === 'history') loadMedicalHistory();
  }, [activeTab]);

  const loadMoodHistory = async () => {
    try {
      const response = await getMoodHistory();
      setMoodHistory(response.data.moods || []);
    } catch (error) {
      console.error('Failed to load mood history');
    }
  };

  const loadActivityHistory = async () => {
    try {
      const response = await getActivityHistory();
      setActivityStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load activity history');
    }
  };

  const loadMedicalHistory = async () => {
    try {
      const response = await getMedicalHistory();
      setMedicalHistory(response.data.analyses || []);
    } catch (error) {
      console.error('Failed to load medical history');
    }
  };

  const handleMedicalUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setMedicalPreview(reader.result);
    reader.readAsDataURL(file);

    setLoading(true);
    setMedicalResult(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('imageType', 'xray');

    try {
      const response = await analyzeMedicalImage(formData);
      setMedicalResult(response.data);
      setUser({ ...user, guardianCoins: user.guardianCoins + 25 });
    } catch (error) {
      alert(error.response?.data?.error || 'Analysis failed');
    }
    setLoading(false);
  };

  const handleMoodLog = async () => {
    if (!moodText.trim()) return;

    setLoading(true);
    try {
      const response = await logMood({ mood: 'reflective', moodText });
      setMoodResult(response.data);
      setUser({ ...user, guardianCoins: user.guardianCoins + 10 });
      setTimeout(() => setMoodText(''), 2000);
    } catch (error) {
      alert('Failed to log mood');
    }
    setLoading(false);
  };

  const handleGenerateWorkout = async () => {
    setLoading(true);
    try {
      const response = await generateWorkout({
        workoutType,
        duration: 30,
        fitnessLevel: 'intermediate'
      });
      setGeneratedWorkout(response.data.workout);
      setUser({ ...user, guardianCoins: user.guardianCoins + 20 });
    } catch (error) {
      alert('Failed to generate workout');
    }
    setLoading(false);
  };

  const handleCompleteWorkout = async () => {
    if (!generatedWorkout) return;

    setLoading(true);
    try {
      await completeWorkout(generatedWorkout._id);
      setUser({ ...user, guardianCoins: user.guardianCoins + 30 });
      alert('Workout completed! +30 coins earned!');
      setGeneratedWorkout(null);
    } catch (error) {
      alert('Failed to complete workout');
    }
    setLoading(false);
  };

  const handleLogActivity = async () => {
    if (!steps || steps <= 0) return;

    setLoading(true);
    try {
      const response = await logActivity({
        steps: parseInt(steps),
        distance: (parseInt(steps) * 0.0008).toFixed(2),
        calories: Math.round(parseInt(steps) * 0.04)
      });

      if (response.data.coinsEarned > 0) {
        setUser({ ...user, guardianCoins: user.guardianCoins + response.data.coinsEarned });
      }

      alert(response.data.message);
      setSteps('');
      loadActivityHistory();
    } catch (error) {
      alert('Failed to log activity');
    }
    setLoading(false);
  };

  const handleQuizSubmit = async () => {
    setLoading(true);
    try {
      const response = await submitQuiz({ answers: quizAnswers });
      setQuizResult(response.data);
      setUser({
        ...user,
        guardianCoins: user.guardianCoins + 100,
        archetype: response.data.archetype
      });
    } catch (error) {
      alert('Failed to submit quiz');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-2 rounded-xl">
              <Heart className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">GuardianChain</h1>
              {user?.archetype && (
                <p className="text-sm text-purple-200">{user.archetype}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-yellow-400 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <Award className="text-yellow-900" size={20} />
              <span className="font-bold text-yellow-900">{user?.guardianCoins || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <User size={20} />
              <span className="font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={logoutUser}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'medical', label: 'Medical AI', icon: Heart },
            { id: 'mood', label: 'Mood Tracker', icon: Brain },
            { id: 'workout', label: 'Workouts', icon: Dumbbell },
            { id: 'activity', label: 'Activity', icon: Footprints },
            { id: 'personality', label: 'Personality', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'history', label: 'History', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user?.name}! 👋</h2>
            <p className="text-gray-600 mb-6">Your holistic wellness journey starts here</p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
                <Heart size={32} className="mb-3" />
                <h3 className="text-xl font-bold mb-2">Medical AI</h3>
                <p className="text-purple-100">Analyze X-rays and prescriptions</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-2xl text-white">
                <Brain size={32} className="mb-3" />
                <h3 className="text-xl font-bold mb-2">Mental Wellness</h3>
                <p className="text-pink-100">Track your mood and emotions</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl text-white">
                <Award size={32} className="mb-3" />
                <h3 className="text-xl font-bold mb-2">Guardian Coins</h3>
                <p className="text-indigo-100">Earn rewards for healthy habits</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <h3 className="font-bold text-gray-800 mb-3">Daily Motivation ✨</h3>
              <p className="text-lg italic text-gray-700">
                "Your health is an investment, not an expense. Every small step today builds a stronger tomorrow."
              </p>
            </div>
          </div>
        )}

        {/* Medical AI */}
        {activeTab === 'medical' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Medical AI Assistant</h2>
            <p className="text-gray-600 mb-6">Upload X-rays or prescriptions for AI analysis</p>

            <div className="border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center mb-6 bg-purple-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleMedicalUpload}
                className="hidden"
                id="medicalUpload"
              />
              <label htmlFor="medicalUpload" className="cursor-pointer">
                <Upload size={48} className="mx-auto text-purple-600 mb-4" />
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Click to upload medical image
                </p>
                <p className="text-sm text-gray-600">
                  Supports: X-rays, prescriptions, medical reports
                </p>
              </label>
            </div>

            {medicalPreview && (
              <div className="mb-6">
                <img
                  src={medicalPreview}
                  alt="Uploaded"
                  className="max-w-md mx-auto rounded-xl shadow-lg"
                />
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <Loader className="animate-spin mx-auto text-purple-600 mb-4" size={48} />
                <p className="text-gray-600 font-semibold">Analyzing with AI...</p>
              </div>
            )}

            {medicalResult && !loading && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h3>

                <div className="bg-white rounded-xl p-4 mb-4">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(medicalResult.analysis, null, 2)}</pre>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Medical Disclaimer:</strong> {medicalResult.disclaimer}
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                    +{medicalResult.coinsEarned} Guardian Coins Earned! 🎉
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mood Tracker */}
        {activeTab === 'mood' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Mental Wellness Sanctuary</h2>
            <p className="text-gray-600 mb-6">Share your thoughts and feelings</p>

            <div className="mb-6">
              <textarea
                value={moodText}
                onChange={(e) => setMoodText(e.target.value)}
                placeholder="How are you feeling today? Share your thoughts..."
                className="w-full p-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 min-h-32"
              />
              <button
                onClick={handleMoodLog}
                disabled={loading || !moodText.trim()}
                className="mt-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Log Mood'}
              </button>
            </div>

            {moodResult && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Mood Reflection</h3>

                <div className="mb-4">
                  <p className="text-gray-700 italic text-lg">{moodResult.reflection}</p>
                </div>

                <div className="bg-purple-100 rounded-xl p-4 mb-4">
                  <p className="text-purple-900">
                    <strong>Theme:</strong> {moodResult.moodLog.theme}
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                    +{moodResult.coinsEarned} Guardian Coins Earned! 🌟
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Workout Generator */}
        {activeTab === 'workout' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Workout Generator 💪</h2>
            <p className="text-gray-600 mb-6">Get a personalized workout plan powered by AI</p>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">Workout Type:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['strength', 'cardio', 'yoga', 'flexibility'].map(type => (
                  <button
                    key={type}
                    onClick={() => setWorkoutType(type)}
                    className={`px-4 py-3 rounded-xl font-semibold capitalize transition-all ${workoutType === type
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateWorkout}
                disabled={loading}
                className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 w-full md:w-auto"
              >
                {loading ? 'Generating...' : 'Generate Workout'}
              </button>
            </div>

            {generatedWorkout && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Personalized Workout</h3>

                <div className="space-y-4 mb-6">
                  {generatedWorkout.exercises.map((exercise, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                      <h4 className="font-bold text-lg text-gray-800 mb-2">{exercise.name}</h4>
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div>
                          <span className="text-sm text-gray-600">Sets:</span>
                          <p className="font-semibold text-purple-600">{exercise.sets}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Reps:</span>
                          <p className="font-semibold text-purple-600">{exercise.reps}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Duration:</span>
                          <p className="font-semibold text-purple-600">{exercise.duration} min</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 mt-2">
                        <p className="text-sm text-blue-900">💡 <strong>Tip:</strong> {exercise.focusTip}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCompleteWorkout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Completing...' : 'Mark as Completed (+30 Coins)'}
                </button>

                <div className="mt-4 text-center">
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                    +20 Guardian Coins Earned! 🎉
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Tracker */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Activity Tracker 🚶</h2>
            <p className="text-gray-600 mb-6">Track your daily steps and earn rewards</p>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-3">Log Today's Steps:</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  placeholder="Enter step count..."
                  className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleLogActivity}
                  disabled={loading || !steps}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Logging...' : 'Log Steps'}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Reward Tiers 🏆</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">2,000+ steps</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-sm">+10 Coins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">5,000+ steps</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-sm">+25 Coins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">10,000+ steps</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-sm">+50 Coins</span>
                </div>
              </div>
            </div>

            {activityStats && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
                  <TrendingUp size={32} className="mb-3" />
                  <h3 className="text-2xl font-bold mb-1">{activityStats.totalSteps.toLocaleString()}</h3>
                  <p className="text-blue-100">Total Steps</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
                  <Footprints size={32} className="mb-3" />
                  <h3 className="text-2xl font-bold mb-1">{activityStats.avgSteps.toLocaleString()}</h3>
                  <p className="text-green-100">Average Daily Steps</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
                  <Activity size={32} className="mb-3" />
                  <h3 className="text-2xl font-bold mb-1">{activityStats.totalDays}</h3>
                  <p className="text-purple-100">Days Tracked</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Personality Quiz */}
        {activeTab === 'personality' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Personality Quiz 🎭</h2>
            <p className="text-gray-600 mb-6">Discover your wellness archetype</p>
            {!quizResult ? (
              <div>
                {quizStep < quizQuestions.length ? (
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Question {quizStep + 1} of {quizQuestions.length}</span>
                        <span>{Math.round(((quizStep + 1) / quizQuestions.length) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                          style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">
                        {quizQuestions[quizStep].question}
                      </h3>

                      <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{quizQuestions[quizStep].low}</span>
                          <span>{quizQuestions[quizStep].high}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={quizAnswers[quizStep]}
                          onChange={(e) => {
                            const newAnswers = [...quizAnswers];
                            newAnswers[quizStep] = parseInt(e.target.value);
                            setQuizAnswers(newAnswers);
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-center mt-2">
                          <span className="text-2xl font-bold text-purple-600">{quizAnswers[quizStep]}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (quizStep < quizQuestions.length - 1) {
                            setQuizStep(quizStep + 1);
                          } else {
                            handleQuizSubmit();
                          }
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        {quizStep < quizQuestions.length - 1 ? 'Next Question' : 'Get My Results'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{quizResult.archetype}</h3>
                    <p className="text-lg text-gray-700 italic">{quizResult.description}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-gray-800 mb-4">Your Trait Profile:</h4>
                    <div className="space-y-4">
                      {Object.entries(quizResult.traits).map(([trait, value]) => (
                        <div key={trait}>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-700 capitalize">{trait}</span>
                            <span className="font-semibold text-purple-600">{value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold text-lg">
                      +{quizResult.coinsEarned} Guardian Coins Earned! 🎉
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mood Analytics */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Mood Analytics 📊</h2>
            <p className="text-gray-600 mb-6">Track your emotional journey over time</p>

            {moodHistory.length > 0 ? (
              <div className="space-y-4">
                {moodHistory.slice(0, 10).map((mood, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800">{mood.sentiment}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(mood.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{mood.moodText}</p>
                    <div className="bg-purple-100 rounded-lg p-2">
                      <span className="text-sm text-purple-900">Theme: {mood.theme}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No mood entries yet. Start tracking your emotions!</p>
              </div>
            )}
          </div>
        )}

        {/* Medical History */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Medical History 📋</h2>
            <p className="text-gray-600 mb-6">View your past medical analyses</p>

            {medicalHistory.length > 0 ? (
              <div className="space-y-4">
                {medicalHistory.map((analysis, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-800 capitalize">{analysis.imageType} Analysis</span>
                      <span className="text-sm text-gray-600">
                        {new Date(analysis.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <pre className="text-xs overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(analysis.analysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No medical analyses yet. Upload your first image!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
// Root App Component
function App() {
return (
<AuthProvider>
<AppContent />
</AuthProvider>
);
}
function AppContent() {
  const { user, loginUser, loading } = useContext(AuthContext);
if (loading) {
return (
<div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
<Loader className="animate-spin text-white" size={48} />
</div>
);
}
return user ? <MainApp /> : <AuthPage onLogin={loginUser} />;
}
export default App;
