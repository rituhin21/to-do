/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  category: string;
}

const CATEGORIES = ['Personal', 'Work', 'Health', 'Shopping'];

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('zentodo_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Personal');

  useEffect(() => {
    localStorage.setItem('zentodo_tasks', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
      category: selectedCategory,
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const markAsDone = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: true } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = useMemo(() => {
    return todos
      .filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
      })
      .filter(todo => 
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [todos, filter, searchQuery]);

  const stats = useMemo(() => {
    const completed = todos.filter(t => t.completed).length;
    return {
      completed,
      total: todos.length,
      percent: todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0
    };
  }, [todos]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-24">
      {/* Header Section */}
      <header className="px-6 pt-12 pb-6 bg-white border-b border-zinc-100 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Tasks</h1>
            <p className="text-zinc-500 text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <LayoutGrid size={24} />
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-1">Daily Progress</p>
              <h2 className="text-2xl font-bold">{stats.percent}% Completed</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Calendar size={20} />
            </div>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              className="bg-white h-full"
            />
          </div>
          <p className="mt-3 text-indigo-100 text-xs font-medium">
            {stats.completed} of {stats.total} tasks finished
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button className="bg-zinc-100 p-3 rounded-2xl text-zinc-600 hover:bg-zinc-200 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 mt-8">
        {/* Filter Tabs */}
        <div className="flex gap-6 mb-6 border-b border-zinc-100 pb-2">
          {(['active', 'completed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-sm font-semibold capitalize pb-2 relative transition-colors ${
                filter === t ? 'text-indigo-600' : 'text-zinc-400'
              }`}
            >
              {t === 'active' ? 'My Tasks' : 'Done Folder'}
              {filter === t && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                />
              )}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group flex items-center gap-4 p-4 rounded-3xl border transition-all ${
                    todo.completed 
                      ? 'bg-zinc-50 border-zinc-100 opacity-80' 
                      : 'bg-white border-zinc-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                    <ListIcon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${todo.completed ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                      {todo.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {todo.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!todo.completed && (
                      <button 
                        onClick={() => markAsDone(todo.id)}
                        className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                      >
                        Done
                      </button>
                    )}
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <ListIcon size={32} />
                </div>
                <p className="text-zinc-500 font-medium">
                  {filter === 'active' ? 'No active tasks' : 'Done folder is empty'}
                </p>
                <p className="text-zinc-400 text-sm">
                  {filter === 'active' ? 'Time to relax or add a new task!' : 'Complete tasks to see them here.'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Button & Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent">
        <form 
          onSubmit={addTodo}
          className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl shadow-indigo-200/50 p-2 flex items-center border border-zinc-100"
        >
          <div className="flex-1 px-4">
            <div className="flex gap-2 mb-1 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input 
              type="text"
              placeholder="What needs to be done?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full py-2 text-sm font-medium focus:outline-none placeholder:text-zinc-400"
            />
          </div>
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            <Plus size={24} />
          </button>
        </form>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
