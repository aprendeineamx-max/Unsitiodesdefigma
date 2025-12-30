    }, []);

// Save viewMode to localStorage whenever it changes
useEffect(() => {
    localStorage.setItem('lab-manager-view-mode', viewMode);
}, [viewMode]);

// Actions
