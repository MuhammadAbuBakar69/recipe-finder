import './App.css';
import React, { useState, useEffect } from 'react';

// Preset quick search ingredients
const POPULAR_INGREDIENTS = ['Chicken', 'Pasta', 'Beef', 'Cheese', 'Tomato', 'Salmon', 'Rice', 'Potato'];

export default function App() {
  const [searchTerm, setSearchTerm] = useState('chicken');
  const [query, setQuery] = useState('chicken');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selected recipe detail state
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [mealDetail, setMealDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Favorites state saved in localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('rf_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'favorites'

  useEffect(() => {
    localStorage.setItem('rf_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch recipe list by ingredient
  useEffect(() => {
    if (!query.trim()) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query.trim())}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch recipes');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (data.meals) {
            setRecipes(data.meals);
          } else {
            setRecipes([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'An error occurred while fetching recipes.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  // Fetch recipe details when selectedMealId changes
  useEffect(() => {
    if (!selectedMealId) {
      setMealDetail(null);
      return;
    }

    let isMounted = true;
    setLoadingDetail(true);

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${selectedMealId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.meals && data.meals.length > 0) {
            setMealDetail(data.meals[0]);
          }
          setLoadingDetail(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setLoadingDetail(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMealId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setQuery(searchTerm.trim());
    }
  };

  const handleChipClick = (ingredient) => {
    setSearchTerm(ingredient);
    setQuery(ingredient);
  };

  const toggleFavorite = (meal) => {
    const isFav = favorites.some((f) => f.idMeal === meal.idMeal);
    if (isFav) {
      setFavorites(favorites.filter((f) => f.idMeal !== meal.idMeal));
    } else {
      setFavorites([...favorites, { idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb }]);
    }
  };

  // Extract non-empty ingredients and measurements
  const getIngredientsList = (meal) => {
    const list = [];
    if (!meal) return list;
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        list.push({
          ingredient: ing.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return list;
  };

  const displayedRecipes = activeTab === 'search' ? recipes : favorites;

  return (
    <div className="rf-app">
      {/* Header */}
      <header className="rf-header">
        <div className="rf-header-content">
          <h1>🍳 Recipe Finder</h1>
          <p>Discover delicious recipes by main ingredients using TheMealDB</p>
        </div>
      </header>

      {/* Container */}
      <main className="rf-container">
        {/* Search & Tabs bar */}
        <div className="rf-controls">
          <form className="rf-search-bar" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search by ingredient (e.g., chicken, pasta, cheese)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          {/* Quick chips */}
          <div className="rf-chips">
            <span className="rf-chips-label">Popular:</span>
            {POPULAR_INGREDIENTS.map((ing) => (
              <button
                key={ing}
                className={`rf-chip ${query.toLowerCase() === ing.toLowerCase() ? 'active' : ''}`}
                onClick={() => handleChipClick(ing)}
              >
                {ing}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div className="rf-tab-nav">
            <button
              className={activeTab === 'search' ? 'active' : ''}
              onClick={() => setActiveTab('search')}
            >
              🔍 Search Results ({recipes.length})
            </button>
            <button
              className={activeTab === 'favorites' ? 'active' : ''}
              onClick={() => setActiveTab('favorites')}
            >
              ❤️ Saved Favorites ({favorites.length})
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="rf-loading-state">
            <div className="rf-spinner"></div>
            <p>Searching for delicious recipes with "{query}"...</p>
          </div>
        ) : error ? (
          <div className="rf-error-state">
            <p>⚠️ {error}</p>
          </div>
        ) : displayedRecipes.length === 0 ? (
          <div className="rf-empty-state">
            <span>🍽️</span>
            <h3>No recipes found</h3>
            <p>
              {activeTab === 'search'
                ? `No recipes found containing "${query}". Try searching for another ingredient like "beef" or "pasta".`
                : 'You have not saved any recipes to favorites yet.'}
            </p>
          </div>
        ) : (
          <div className="rf-grid">
            {displayedRecipes.map((meal) => {
              const isFav = favorites.some((f) => f.idMeal === meal.idMeal);
              return (
                <div key={meal.idMeal} className="rf-card">
                  <div className="rf-card-img-wrapper">
                    <img src={meal.strMealThumb} alt={meal.strMeal} loading="lazy" />
                    <button
                      className={`rf-fav-btn ${isFav ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(meal);
                      }}
                      title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div className="rf-card-body">
                    <h3>{meal.strMeal}</h3>
                    <button
                      className="rf-view-btn"
                      onClick={() => setSelectedMealId(meal.idMeal)}
                    >
                      View Full Recipe
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal View for Recipe Details */}
      {selectedMealId && (
        <div className="rf-modal-backdrop" onClick={() => setSelectedMealId(null)}>
          <div className="rf-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rf-modal-close" onClick={() => setSelectedMealId(null)}>
              ✕
            </button>

            {loadingDetail || !mealDetail ? (
              <div className="rf-loading-state">
                <div className="rf-spinner"></div>
                <p>Loading recipe details...</p>
              </div>
            ) : (
              <div className="rf-detail-content">
                <div className="rf-detail-header">
                  <img src={mealDetail.strMealThumb} alt={mealDetail.strMeal} />
                  <div className="rf-detail-meta">
                    <h2>{mealDetail.strMeal}</h2>
                    <div className="rf-tags">
                      {mealDetail.strCategory && <span className="rf-tag">{mealDetail.strCategory}</span>}
                      {mealDetail.strArea && <span className="rf-tag alt">{mealDetail.strArea} Cuisine</span>}
                    </div>
                    {mealDetail.strYoutube && (
                      <a
                        href={mealDetail.strYoutube}
                        target="_blank"
                        rel="noreferrer"
                        className="rf-yt-link"
                      >
                        ▶ Watch Video Tutorial
                      </a>
                    )}
                  </div>
                </div>

                <div className="rf-detail-body">
                  <div className="rf-ingredients-section">
                    <h3>Ingredients</h3>
                    <ul className="rf-ingredients-list">
                      {getIngredientsList(mealDetail).map((item, idx) => (
                        <li key={idx}>
                          <span className="rf-ing-name">{item.ingredient}</span>
                          <span className="rf-ing-measure">{item.measure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rf-instructions-section">
                    <h3>Instructions</h3>
                    <div className="rf-instructions-text">
                      {mealDetail.strInstructions
                        ? mealDetail.strInstructions
                            .split('\r\n')
                            .filter((step) => step.trim().length > 0)
                            .map((step, idx) => (
                              <p key={idx}>{step}</p>
                            ))
                        : 'No instructions provided.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
