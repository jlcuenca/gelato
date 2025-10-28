import React, { useState, useEffect } from 'react';
import { Bluetooth, Power, ThermometerSnowflake, Gauge, Zap, PlayCircle, StopCircle, AlertCircle, Save, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function IceCreamController() {
  const [device, setDevice] = useState(null);
  const [connected, setConnected] = useState(false);
  const [motorRunning, setMotorRunning] = useState(false);
  const [temperature, setTemperature] = useState(20);
  const [rpm, setRpm] = useState(0);
  const [amperage, setAmperage] = useState(0);
  const [targetTemp, setTargetTemp] = useState(-5);
  const [targetRpm, setTargetRpm] = useState(80);
  const [mixingTime, setMixingTime] = useState(15);
  const [logs, setLogs] = useState([]);
  
  // CRUD States
  const [recipes, setRecipes] = useState([
    { id: 1, name: 'Helado de Vainilla', temp: -5, rpm: 80, time: 15, color: 'yellow' },
    { id: 2, name: 'Helado de Chocolate', temp: -6, rpm: 90, time: 18, color: 'brown' },
    { id: 3, name: 'Gelato Italiano', temp: -8, rpm: 120, time: 12, color: 'pink' },
    { id: 4, name: 'Frozen Yogurt', temp: -4, rpm: 70, time: 10, color: 'purple' },
  ]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    temp: -5,
    rpm: 80,
    time: 15,
    color: 'blue'
  });

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString('es-MX');
    setLogs(prev => [...prev.slice(-4), `[${timestamp}] ${message}`]);
  };

  const connectBluetooth = async () => {
    try {
      addLog('Buscando dispositivo Bluetooth...');
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['battery_service'] }],
        optionalServices: ['battery_service']
      });
      
      addLog(`Conectando a ${device.name}...`);
      const server = await device.gatt.connect();
      
      setDevice(device);
      setConnected(true);
      addLog('✓ Conectado exitosamente');
      
      device.addEventListener('gattserverdisconnected', () => {
        setConnected(false);
        setMotorRunning(false);
        addLog('✗ Dispositivo desconectado');
      });
    } catch (error) {
      addLog(`✗ Error: ${error.message}`);
    }
  };

  const disconnect = () => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
      addLog('Desconectado manualmente');
    }
    setDevice(null);
    setConnected(false);
    setMotorRunning(false);
  };

  const startMotor = () => {
    if (!connected) {
      addLog('✗ No hay conexión Bluetooth');
      return;
    }
    setMotorRunning(true);
    addLog(`▶ Motor iniciado - ${targetRpm} RPM, ${mixingTime} min`);
  };

  const stopMotor = () => {
    if (!connected) {
      addLog('✗ No hay conexión Bluetooth');
      return;
    }
    setMotorRunning(false);
    addLog('■ Motor detenido');
  };

  const sendParameters = () => {
    if (!connected) {
      addLog('✗ No hay conexión Bluetooth');
      return;
    }
    addLog(`📤 Enviando: Temp=${targetTemp}°C, RPM=${targetRpm}, Tiempo=${mixingTime}min`);
  };

  // CRUD Functions
  const openCreateModal = () => {
    setEditingRecipe(null);
    setRecipeForm({ name: '', temp: -5, rpm: 80, time: 15, color: 'blue' });
    setShowRecipeModal(true);
  };

  const openEditModal = (recipe) => {
    setEditingRecipe(recipe);
    setRecipeForm({ ...recipe });
    setShowRecipeModal(true);
  };

  const saveRecipe = () => {
    if (!recipeForm.name.trim()) {
      addLog('✗ El nombre de la receta es requerido');
      return;
    }

    if (editingRecipe) {
      setRecipes(recipes.map(r => r.id === editingRecipe.id ? { ...recipeForm, id: r.id } : r));
      addLog(`✓ Receta "${recipeForm.name}" actualizada`);
    } else {
      const newRecipe = { ...recipeForm, id: Date.now() };
      setRecipes([...recipes, newRecipe]);
      addLog(`✓ Receta "${recipeForm.name}" creada`);
    }
    setShowRecipeModal(false);
  };

  const deleteRecipe = (id) => {
    const recipe = recipes.find(r => r.id === id);
    if (window.confirm(`¿Eliminar la receta "${recipe.name}"?`)) {
      setRecipes(recipes.filter(r => r.id !== id));
      if (selectedRecipe?.id === id) setSelectedRecipe(null);
      addLog(`✗ Receta "${recipe.name}" eliminada`);
    }
  };

  const loadRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setTargetTemp(recipe.temp);
    setTargetRpm(recipe.rpm);
    setMixingTime(recipe.time);
    addLog(`📋 Receta "${recipe.name}" cargada`);
  };

  useEffect(() => {
    if (motorRunning) {
      const interval = setInterval(() => {
        setTemperature(prev => Math.max(targetTemp, prev - 0.5));
        setRpm(prev => Math.min(targetRpm, prev + 5));
        setAmperage(prev => Math.min(8, prev + 0.2));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setRpm(0);
      setAmperage(0);
    }
  }, [motorRunning, targetTemp, targetRpm]);

  const colorClasses = {
    yellow: 'from-yellow-100 to-yellow-200 border-yellow-400',
    brown: 'from-amber-100 to-amber-200 border-amber-600',
    pink: 'from-pink-100 to-pink-200 border-pink-400',
    purple: 'from-purple-100 to-purple-200 border-purple-400',
    blue: 'from-blue-100 to-blue-200 border-blue-400',
    green: 'from-green-100 to-green-200 border-green-400',
    red: 'from-red-100 to-red-200 border-red-400',
    orange: 'from-orange-100 to-orange-200 border-orange-400'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <ThermometerSnowflake className="text-cyan-600" size={36} />
              Control de Heladera
            </h1>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="font-semibold">{connected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>

          <div className="flex gap-3">
            {!connected ? (
              <button onClick={connectBluetooth} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Bluetooth size={20} />
                Conectar Bluetooth
              </button>
            ) : (
              <button onClick={disconnect} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Power size={20} />
                Desconectar
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column - Recipes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recetas</h2>
                <button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors">
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recipes.map(recipe => (
                  <div key={recipe.id} className={`bg-gradient-to-r ${colorClasses[recipe.color]} border-2 p-4 rounded-xl ${selectedRecipe?.id === recipe.id ? 'ring-4 ring-blue-400' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-800 flex-1">{recipe.name}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(recipe)} className="p-1 hover:bg-white/50 rounded transition-colors">
                          <Edit2 size={16} className="text-gray-700" />
                        </button>
                        <button onClick={() => deleteRecipe(recipe.id)} className="p-1 hover:bg-white/50 rounded transition-colors">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1 mb-3">
                      <div>🌡️ {recipe.temp}°C</div>
                      <div>⚡ {recipe.rpm} RPM</div>
                      <div>⏱️ {recipe.time} min</div>
                    </div>
                    <button onClick={() => loadRecipe(recipe)} className="w-full bg-white/70 hover:bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                      Cargar Receta
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Controls and Status */}
          <div className="lg:col-span-2 space-y-4">
            {/* Parameters Control */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Parámetros de Operación</h2>
                {selectedRecipe && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    {selectedRecipe.name}
                  </span>
                )}
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temperatura (°C)
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="-20" max="10" value={targetTemp} onChange={(e) => setTargetTemp(Number(e.target.value))} className="flex-1" disabled={!connected} />
                    <span className="text-xl font-bold text-cyan-600 w-12 text-right">{targetTemp}°</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    RPM
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="0" max="200" value={targetRpm} onChange={(e) => setTargetRpm(Number(e.target.value))} className="flex-1" disabled={!connected} />
                    <span className="text-xl font-bold text-purple-600 w-12 text-right">{targetRpm}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tiempo (min)
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="5" max="60" value={mixingTime} onChange={(e) => setMixingTime(Number(e.target.value))} className="flex-1" disabled={!connected} />
                    <span className="text-xl font-bold text-orange-600 w-12 text-right">{mixingTime}</span>
                  </div>
                </div>
              </div>

              <button onClick={sendParameters} disabled={!connected} className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                Aplicar Parámetros
              </button>
            </div>

            {/* Status Display */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Estado Actual</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <ThermometerSnowflake className="text-cyan-600" size={20} />
                    <span className="text-sm font-semibold text-gray-700">Temperatura</span>
                  </div>
                  <div className="text-3xl font-bold text-cyan-700">{temperature.toFixed(1)}°C</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="text-purple-600" size={20} />
                    <span className="text-sm font-semibold text-gray-700">RPM</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-700">{rpm}</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-orange-600" size={20} />
                    <span className="text-sm font-semibold text-gray-700">Amperaje</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-700">{amperage.toFixed(1)}A</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={startMotor} disabled={!connected || motorRunning} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <PlayCircle size={24} />
                  Iniciar Motor
                </button>
                <button onClick={stopMotor} disabled={!connected || !motorRunning} className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <StopCircle size={24} />
                  Detener Motor
                </button>
              </div>
            </div>

            {/* Logs */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Registro de Eventos
              </h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm h-32 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">Esperando eventos...</div>
                ) : (
                  logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Modal */}
        {showRecipeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingRecipe ? 'Editar Receta' : 'Nueva Receta'}
                </h3>
                <button onClick={() => setShowRecipeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Receta</label>
                  <input type="text" value={recipeForm.name} onChange={(e) => setRecipeForm({...recipeForm, name: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" placeholder="Ej: Helado de Fresa" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Temperatura: {recipeForm.temp}°C</label>
                  <input type="range" min="-20" max="10" value={recipeForm.temp} onChange={(e) => setRecipeForm({...recipeForm, temp: Number(e.target.value)})} className="w-full" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">RPM: {recipeForm.rpm}</label>
                  <input type="range" min="0" max="200" value={recipeForm.rpm} onChange={(e) => setRecipeForm({...recipeForm, rpm: Number(e.target.value)})} className="w-full" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiempo: {recipeForm.time} min</label>
                  <input type="range" min="5" max="60" value={recipeForm.time} onChange={(e) => setRecipeForm({...recipeForm, time: Number(e.target.value)})} className="w-full" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(colorClasses).map(color => (
                      <button key={color} onClick={() => setRecipeForm({...recipeForm, color})} className={`h-12 rounded-lg border-4 ${recipeForm.color === color ? 'border-gray-800' : 'border-gray-300'} bg-gradient-to-r ${colorClasses[color]}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowRecipeModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button onClick={saveRecipe} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Save size={20} />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}