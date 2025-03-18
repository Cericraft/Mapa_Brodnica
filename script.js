// Upewniamy się, że DOM jest załadowany przed uruchomieniem skryptu
document.addEventListener('DOMContentLoaded', function() {
    // Zmienne globalne
    var map;
    var markers = [];
    var isUserLoggedIn = false;
    
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
                    form.classList.remove('active');
                });
                
                // Pokaż docelowy formularz
                const targetFormId = this.getAttribute('data-tab');
                const targetForm = document.getElementById(targetFormId);
                if (targetForm) {
                    targetForm.classList.add('active');
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
                
                // W tej wersji symulujemy udane logowanie
                showNotification('Zalogowano pomyślnie!', 'success');
                
                // Aktualizujemy status użytkownika
                isUserLoggedIn = true;
                
                // Aktualizujemy interfejs dla zalogowanego użytkownika
                updateUIForLoggedInUser(email);
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
                
                // W tej wersji symulujemy udaną rejestrację
                showNotification('Konto zostało utworzone pomyślnie!', 'success');
                
                // Czyścimy formularz rejestracji
                registerForm.reset();
                
                // Przełączamy na zakładkę logowania
                setTimeout(() => {
                    document.querySelector('.auth-tab-btn[data-tab="login-form"]').click();
                }, 1000);
            });
        }
    }
    
    // Obsługa formularza dodawania miejsca
    function setupAddPlaceForm() {
        const addPlaceForm = document.getElementById('add-place-form');
        if (addPlaceForm) {
            addPlaceForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                const placeName = document.getElementById('place-name').value;
                const placeDesc = document.getElementById('place-desc').value;
                const placeLat = document.getElementById('place-lat').value;
                const placeLng = document.getElementById('place-lng').value;
                
                // W tej wersji symulujemy udane dodanie miejsca
                showNotification('Miejsce zostało dodane pomyślnie!', 'success');
                
                // Dodajemy nowy marker na mapie
                if (map && placeLat && placeLng) {
                    const marker = L.marker([placeLat, placeLng])
                        .addTo(map)
                        .bindPopup(`<strong>${placeName}</strong><br>${placeDesc}`);
                    
                    markers.push(marker);
                }
                
                // Czyścimy formularz
                addPlaceForm.reset();
            });
        }
    }
    
    // Obsługa przycisku wylogowania
    function setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                // Symulujemy udane wylogowanie
                showNotification('Wylogowano pomyślnie!', 'success');
                
                // Aktualizujemy status użytkownika
                isUserLoggedIn = false;
                
                // Aktualizujemy interfejs dla wylogowanego użytkownika
                updateUIForLoggedOutUser();
            });
        }
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
            form.style.display = 'none';
        });
        
        const userProfile = document.getElementById('user-profile');
        if (userProfile) {
            userProfile.style.display = 'block';
            
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
        }
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.style.display = 'block';
        });
        
        document.querySelector('.auth-tab-btn[data-tab="login-form"]').click();
    }
    
    // Funkcja inicjalizująca wszystko
    function init() {
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
    }
    
    // Wywołanie funkcji inicjalizującej
    init();
});