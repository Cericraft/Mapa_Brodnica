// Upewniamy się, że DOM jest załadowany przed uruchomieniem skryptu
document.addEventListener('DOMContentLoaded', function() {
    // Zmienne globalne
    var map;
    var markers = [];
    var isUserLoggedIn = false;
    
    // Dodajemy kontener dla podglądu pełnoekranowego
    function createFullscreenContainer() {
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.id = 'fullscreen-image-container';
        fullscreenContainer.style.display = 'none';
        fullscreenContainer.style.position = 'fixed';
        fullscreenContainer.style.top = '0';
        fullscreenContainer.style.left = '0';
        fullscreenContainer.style.width = '100%';
        fullscreenContainer.style.height = '100%';
        fullscreenContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        fullscreenContainer.style.zIndex = '10000';
        fullscreenContainer.style.justifyContent = 'center';
        fullscreenContainer.style.alignItems = 'center';
        fullscreenContainer.style.cursor = 'pointer';
        
        const fullscreenImage = document.createElement('img');
        fullscreenImage.id = 'fullscreen-image';
        fullscreenImage.style.maxWidth = '90%';
        fullscreenImage.style.maxHeight = '90%';
        fullscreenImage.style.objectFit = 'contain';
        fullscreenImage.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
        
        const closeButton = document.createElement('div');
        closeButton.innerHTML = '&times;';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '20px';
        closeButton.style.right = '30px';
        closeButton.style.fontSize = '40px';
        closeButton.style.color = 'white';
        closeButton.style.cursor = 'pointer';
        
        fullscreenContainer.appendChild(fullscreenImage);
        fullscreenContainer.appendChild(closeButton);
        document.body.appendChild(fullscreenContainer);
        
        // Dodajemy obsługę zamykania podglądu pełnoekranowego
        fullscreenContainer.addEventListener('click', function() {
            hideFullscreenImage();
        });
        
        closeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            hideFullscreenImage();
        });
    }
    
    // Funkcja pokazująca obraz w trybie pełnoekranowym
    function showFullscreenImage(imageUrl) {
        const container = document.getElementById('fullscreen-image-container');
        const image = document.getElementById('fullscreen-image');
        
        if (container && image) {
            image.src = imageUrl;
            container.style.display = 'flex';
            
            // Blokujemy przewijanie strony gdy podgląd jest aktywny
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Funkcja ukrywająca obraz w trybie pełnoekranowym
    function hideFullscreenImage() {
        const container = document.getElementById('fullscreen-image-container');
        
        if (container) {
            container.style.display = 'none';
            
            // Przywracamy możliwość przewijania strony
            document.body.style.overflow = '';
        }
    }
    
    // Inicjalizacja mapy
    function initMap() {
        var mapElement = document.getElementById('map');
        if (mapElement) {
            map = L.map('map').setView([53.2543, 19.3903], 13); // Współrzędne Brodnicy
            
            // Dodanie warstwy mapy OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            
            console.log('Mapa załadowana poprawnie!');
            
            // Pobieranie i wyświetlanie wszystkich zabytków z bazy danych
            loadPlacesFromDatabase();
            
            // Dodanie obsługi kliknięcia na mapę dla zalogowanych użytkowników
            map.on('click', function(e) {
                if (isUserLoggedIn) {
                    // Przekierowanie do zakładki "DODAJ" i wypełnienie współrzędnych
                    const dodajMenuItem = document.querySelector('.menu-item[data-target="dodaj-container"]');
                    if (dodajMenuItem) {
                        dodajMenuItem.click();
                        
                        // Wypełnienie pól współrzędnych
                        const latInput = document.getElementById('place-lat');
                        const lngInput = document.getElementById('place-lng');
                        
                        if (latInput && lngInput) {
                            latInput.value = e.latlng.lat.toFixed(6);
                            lngInput.value = e.latlng.lng.toFixed(6);
                        }
                    }
                }
            });
        } else {
            console.error('Nie znaleziono elementu mapy!');
        }
    }
    
    // Funkcja pobierająca miejsca z bazy danych
    function loadPlacesFromDatabase() {
        fetch('get_places.php')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Wyczyść istniejące markery
                    clearMarkers();
                    
                    // Dodaj markery dla wszystkich miejsc
                    data.data.forEach(place => {
                        addMarkerToMap(place);
                    });
                } else {
                    showNotification('Błąd podczas pobierania miejsc: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Błąd pobierania danych:', error);
                showNotification('Błąd połączenia z serwerem', 'error');
            });
    }
    
    // Funkcja dodająca marker na mapie z danymi z bazy
    function addMarkerToMap(place) {
        if (map) {
            const lat = parseFloat(place.szerokosc);
            const lng = parseFloat(place.dlugosc);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                // Tworzenie zawartości popup z obrazem
                let popupContent = `<strong>${place.nazwa}</strong>`;
                
                if (place.opis) {
                    popupContent += `<p>${place.opis}</p>`;
                }
                
                // Dodanie zdjęcia do popup jeśli istnieje z możliwością powiększenia
                if (place.zdjecie) {
                    popupContent += `<img src="${place.zdjecie}" alt="${place.nazwa}" style="width:100%; max-width:200px; margin-top:10px; cursor:pointer;" class="popup-image" data-full-img="${place.zdjecie}">`;
                    popupContent += `<div style="text-align:center; margin-top:5px; font-size:12px; color:#666;">Kliknij zdjęcie, aby powiększyć</div>`;
                }
                
                const marker = L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(popupContent);
                
                // Dodajemy nasłuchiwanie na zdarzenie otwarcia popup
                marker.on('popupopen', function() {
                    const popupImages = document.querySelectorAll('.popup-image');
                    popupImages.forEach(img => {
                        img.addEventListener('click', function(e) {
                            e.stopPropagation(); // Zapobiegamy zamknięciu popup przy kliknięciu
                            const fullImageUrl = this.getAttribute('data-full-img');
                            showFullscreenImage(fullImageUrl);
                        });
                    });
                });
                
                markers.push(marker);
            }
        }
    }
    
    // Funkcja czyszcząca wszystkie markery z mapy
    function clearMarkers() {
        markers.forEach(marker => {
            map.removeLayer(marker);
        });
        markers = [];
    }
    
    // Obsługa nawigacji między zakładkami
    function setupTabNavigation() {
        document.querySelectorAll('.menu-item').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                
                // Pobierz identyfikator docelowej sekcji z atrybutu data-target
                let targetId = this.getAttribute('data-target');
                
                // Ukryj wszystkie sekcje
                document.querySelectorAll('.content-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Usuń klasę 'active' ze wszystkich elementów menu
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Dodaj klasę 'active' do klikniętego elementu menu
                this.classList.add('active');
                
                // Pokaż docelową sekcję
                let targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    
                    // Jeśli przełączamy na widok mapy, warto odświeżyć jej rozmiar
                    if (targetId === 'mapa-container' && map) {
                        setTimeout(function() {
                            map.invalidateSize();
                        }, 100);
                    }
                } else {
                    console.error('Nie znaleziono sekcji:', targetId);
                }
            });
        });
    }
    
    // Obsługa zakładek w sekcji logowania/rejestracji
    function setupAuthTabs() {
        document.querySelectorAll('.auth-tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Usuń klasę 'active' ze wszystkich przycisków zakładek
                document.querySelectorAll('.auth-tab-btn').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Dodaj klasę 'active' do klikniętego przycisku
                this.classList.add('active');
                
                // Ukryj wszystkie formularze
                document.querySelectorAll('.auth-form').forEach(form => {
                    if (form.id !== 'user-profile') {
                        form.style.display = 'none';
                    }
                });
                
                // Pokaż docelowy formularz
                const targetFormId = this.getAttribute('data-tab');
                const targetForm = document.getElementById(targetFormId);
                if (targetForm) {
                    targetForm.classList.add('active');
                    targetForm.style.display = 'block';
                }
            });
        });
    }
    
    // Obsługa przycisku przekierowania do logowania
    function setupLoginRedirect() {
        const gotoLoginBtn = document.getElementById('goto-login-btn');
        if (gotoLoginBtn) {
            gotoLoginBtn.addEventListener('click', function() {
                // Symulacja kliknięcia w odpowiedni element menu
                const logowanieMenuItem = document.querySelector('.menu-item[data-target="logowanie-container"]');
                if (logowanieMenuItem) {
                    logowanieMenuItem.click();
                }
            });
        }
    }
    
    // Funkcja do wyświetlania powiadomień
    function showNotification(message, type) {
        // Sprawdzamy czy kontener na powiadomienia istnieje
        let notificationContainer = document.getElementById('notification-container');
        
        // Jeśli nie, tworzymy go
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '9999';
            document.body.appendChild(notificationContainer);
        }
        
        // Tworzymy nowe powiadomienie
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.style.padding = '12px 20px';
        notification.style.margin = '0 0 10px 0';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        notification.style.animation = 'fadeIn 0.5s';
        
        // Ustawiamy styl w zależności od typu
        if (type === 'success') {
            notification.style.backgroundColor = '#d4edda';
            notification.style.color = '#155724';
            notification.style.borderLeft = '4px solid #155724';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#f8d7da';
            notification.style.color = '#721c24';
            notification.style.borderLeft = '4px solid #721c24';
        } else {
            notification.style.backgroundColor = '#d1ecf1';
            notification.style.color = '#0c5460';
            notification.style.borderLeft = '4px solid #0c5460';
        }
        
        // Dodajemy treść powiadomienia
        notification.textContent = message;
        
        // Dodajemy powiadomienie do kontenera
        notificationContainer.appendChild(notification);
        
        // Automatycznie usuwamy powiadomienie po 5 sekundach
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'opacity 0.5s, transform 0.5s';
            
            setTimeout(() => {
                if (notificationContainer.contains(notification)) {
                    notificationContainer.removeChild(notification);
                }
                
                // Jeśli nie ma więcej powiadomień, usuwamy kontener
                if (notificationContainer.childNodes.length === 0) {
                    if (document.body.contains(notificationContainer)) {
                        document.body.removeChild(notificationContainer);
                    }
                }
            }, 500);
        }, 5000);
    }
    
    // Obsługa formularza logowania
    function setupLoginForm() {
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                // Tworzymy obiekt FormData
                const formData = new FormData();
                formData.append('email', email);
                formData.append('password', password);
                
                // Wysyłamy żądanie logowania
                fetch('login.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Zalogowano pomyślnie!', 'success');
                        
                        // Aktualizujemy status użytkownika
                        isUserLoggedIn = true;
                        
                        // Aktualizujemy interfejs dla zalogowanego użytkownika
                        updateUIForLoggedInUser(data.email);
                    } else {
                        showNotification(data.message || 'Błąd logowania', 'error');
                    }
                })
                .catch(error => {
                    console.error('Błąd:', error);
                    showNotification('Błąd połączenia z serwerem', 'error');
                });
            });
        }
    }
    
    // Obsługa formularza rejestracji
    function setupRegisterForm() {
        const registerForm = document.getElementById('register-form-element');
        if (registerForm) {
            registerForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                const username = document.getElementById('register-username').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const passwordConfirm = document.getElementById('register-password-confirm').value;
                
                // Sprawdzamy czy hasła są zgodne
                if (password !== passwordConfirm) {
                    showNotification('Hasła nie są identyczne', 'error');
                    return;
                }
                
                // Tworzymy obiekt FormData
                const formData = new FormData();
                formData.append('username', username);
                formData.append('email', email);
                formData.append('password', password);
                
                // Wysyłamy żądanie rejestracji
                fetch('register.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Konto zostało utworzone pomyślnie!', 'success');
                        
                        // Czyścimy formularz rejestracji
                        registerForm.reset();
                        
                        // Przełączamy na zakładkę logowania
                        setTimeout(() => {
                            document.querySelector('.auth-tab-btn[data-tab="login-form"]').click();
                        }, 1000);
                    } else {
                        showNotification(data.message || 'Błąd rejestracji', 'error');
                    }
                })
                .catch(error => {
                    console.error('Błąd:', error);
                    showNotification('Błąd połączenia z serwerem', 'error');
                });
            });
        }
    }
    
    // Obsługa formularza dodawania miejsca
    function setupAddPlaceForm() {
        const addPlaceForm = document.getElementById('add-place-form');
        if (addPlaceForm) {
            addPlaceForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                if (!isUserLoggedIn) {
                    showNotification('Musisz być zalogowany, aby dodać miejsce', 'error');
                    return;
                }
                
                const placeName = document.getElementById('place-name').value;
                const placeDesc = document.getElementById('place-desc').value;
                const placeLat = document.getElementById('place-lat').value;
                const placeLng = document.getElementById('place-lng').value;
                const placePhotos = document.getElementById('place-photos').files;
                
                // Tworzymy obiekt FormData
                const formData = new FormData();
                formData.append('name', placeName);
                formData.append('description', placeDesc);
                formData.append('latitude', placeLat);
                formData.append('longitude', placeLng);
                
                // Dodajemy zdjęcia (jeśli istnieją)
                if (placePhotos.length > 0) {
                    for (let i = 0; i < placePhotos.length; i++) {
                        formData.append('photos[]', placePhotos[i]);
                    }
                }
                
                // Wysyłamy żądanie dodania miejsca
                fetch('add_place.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Miejsce zostało dodane pomyślnie!', 'success');
                        
                        // Odświeżamy miejsca na mapie
                        loadPlacesFromDatabase();
                        
                        // Czyścimy formularz
                        addPlaceForm.reset();
                        
                        // Przełączamy na zakładkę mapy
                        const mapaMenuItem = document.querySelector('.menu-item[data-target="mapa-container"]');
                        if (mapaMenuItem) {
                            mapaMenuItem.click();
                        }
                    } else {
                        showNotification(data.message || 'Błąd dodawania miejsca', 'error');
                    }
                })
                .catch(error => {
                    console.error('Błąd:', error);
                    showNotification('Błąd połączenia z serwerem', 'error');
                });
            });
        }
    }
    
    // Obsługa przycisku wylogowania
    function setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                // Wysyłamy żądanie wylogowania
                fetch('logout.php')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Wylogowano pomyślnie!', 'success');
                        
                        // Aktualizujemy status użytkownika
                        isUserLoggedIn = false;
                        
                        // Aktualizujemy interfejs dla wylogowanego użytkownika
                        updateUIForLoggedOutUser();
                    } else {
                        showNotification(data.message || 'Błąd wylogowania', 'error');
                    }
                })
                .catch(error => {
                    console.error('Błąd:', error);
                    showNotification('Błąd połączenia z serwerem', 'error');
                    
                    // Na wypadek problemów z serwerem, i tak wylogowujemy użytkownika lokalnie
                    isUserLoggedIn = false;
                    updateUIForLoggedOutUser();
                });
            });
        }
    }
    
    // Sprawdzanie stanu sesji
    function checkSession() {
        fetch('check_session.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.logged_in) {
                isUserLoggedIn = true;
                updateUIForLoggedInUser(data.email);
            } else {
                isUserLoggedIn = false;
                updateUIForLoggedOutUser();
            }
        })
        .catch(error => {
            console.error('Błąd sprawdzania sesji:', error);
            isUserLoggedIn = false;
            updateUIForLoggedOutUser();
        });
    }
    
    // Aktualizacja interfejsu dla zalogowanego użytkownika
    function updateUIForLoggedInUser(email) {
        // Aktualizujemy pasek statusu
        const userStatusElement = document.getElementById('user-status');
        if (userStatusElement) {
        userStatusElement.innerHTML = `<span>Zalogowano jako: ${email} (Użytkownik)</span>`;
        }
        
        // Pokazujemy formularz dodawania miejsca
        const loginRequiredMessage = document.getElementById('login-required-message');
        if (loginRequiredMessage) {
        loginRequiredMessage.style.display = 'none';
        }
        
        const addPlaceForm = document.getElementById('add-place-form');
        if (addPlaceForm) {
        addPlaceForm.style.display = 'block';
        }
        
        // Pokazujemy profil użytkownika w sekcji logowania
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
            if (form.id !== 'user-profile') {
                form.style.display = 'none';
            }
        });
        // Ukrywamy przyciski zakładek logowania/rejestracji
        const authTabs = document.getElementById('auth-tabs');
        if (authTabs) {
        authTabs.style.display = 'none';
        }
        
        const userProfile = document.getElementById('user-profile');
        if (userProfile) {
            userProfile.style.display = 'block';
            userProfile.classList.add('active');
            
            const profileUsername = document.getElementById('profile-username');
            if (profileUsername) {
                profileUsername.textContent = email;
            }
            
            const profileEmail = document.getElementById('profile-email');
            if (profileEmail) {
                profileEmail.textContent = email;
            }
    }
}
    
    // Aktualizacja interfejsu dla wylogowanego użytkownika
    function updateUIForLoggedOutUser() {
        // Aktualizujemy pasek statusu
        const userStatusElement = document.getElementById('user-status');
        if (userStatusElement) {
            userStatusElement.innerHTML = `<span>Nie jesteś zalogowany</span>`;
        }
        
        // Ukrywamy formularz dodawania miejsca
        const loginRequiredMessage = document.getElementById('login-required-message');
        if (loginRequiredMessage) {
            loginRequiredMessage.style.display = 'block';
        }
        
        const addPlaceForm = document.getElementById('add-place-form');
        if (addPlaceForm) {
            addPlaceForm.style.display = 'none';
        }
        
        // Resetujemy sekcję logowania
        const userProfile = document.getElementById('user-profile');
        if (userProfile) {
            userProfile.style.display = 'none';
            userProfile.classList.remove('active');
        }
        // Pokazujemy z powrotem przyciski zakładek logowania/rejestracji
        const authTabs = document.getElementById('auth-tabs');
        if (authTabs) {
            authTabs.style.display = 'block';
        }
        
        // Przywracamy widoczność formularzy logowania i rejestracji
        document.querySelectorAll('.auth-form').forEach(form => {
            if (form.id !== 'user-profile') {
                form.style.display = 'block';
            }
            form.classList.remove('active');
        });
        
        // Aktywujemy zakładkę logowania i odpowiedni formularz
        const loginTab = document.querySelector('.auth-tab-btn[data-tab="login-form"]');
        if (loginTab) {
            // Ustawiamy aktywną zakładkę
            document.querySelectorAll('.auth-tab-btn').forEach(tab => {
                tab.classList.remove('active');
            });
            loginTab.classList.add('active');
            
            // Ustawiamy aktywny formularz
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.classList.add('active');
            }
        }
    }
    // Aktywacja domyślnej zakładki przy starcie
    function activateDefaultLoginTab() {
        // Ukryj wszystkie formularze
    document.querySelectorAll('.auth-form').forEach(form => {
        if (form.id !== 'user-profile') {
            form.style.display = 'none';
        }
    });

        // Pobierz pierwszą zakładkę (prawdopodobnie logowanie)
        const defaultLoginTab = document.querySelector('.auth-tab-btn');
        if (defaultLoginTab) {
            defaultLoginTab.click(); // Symulujemy kliknięcie
            // Dodatkowo pokaż formularz związany z domyślną zakładką
        const targetFormId = defaultLoginTab.getAttribute('data-tab');
        const targetForm = document.getElementById(targetFormId);
        if (targetForm) {
            targetForm.style.display = 'block';
        }
    }

    }

    
    // Funkcja inicjalizująca wszystko
    function init() {
        // Tworzenie kontenera dla pełnoekranowego podglądu zdjęć
        createFullscreenContainer();
        
        // Inicjalizacja mapy
        initMap();
        
        // Konfiguracja nawigacji między zakładkami
        setupTabNavigation();
        
        // Konfiguracja zakładek w sekcji logowania
        setupAuthTabs();
        
        // Konfiguracja przekierowania do logowania
        setupLoginRedirect();
        
        // Konfiguracja formularza logowania
        setupLoginForm();
        
        // Konfiguracja formularza rejestracji
        setupRegisterForm();
        
        // Konfiguracja formularza dodawania miejsca
        setupAddPlaceForm();
        
        // Konfiguracja przycisku wylogowania
        setupLogoutButton();
        
        // Sprawdzanie stanu sesji użytkownika
        checkSession();

        // Wywołaj funkcję aktywującą domyślną zakładkę
        activateDefaultLoginTab();
        }
    
    // Wywołanie funkcji inicjalizującej
    init();
});