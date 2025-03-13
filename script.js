// Upewniamy się, że DOM jest załadowany przed uruchomieniem skryptu
document.addEventListener('DOMContentLoaded', function() {
    // Inicjalizacja mapy
    var mapElement = document.getElementById('map');
    if (mapElement) {
        var map = L.map('map').setView([53.2543, 19.3903], 13); // Współrzędne Brodnicy
        
        // Dodanie warstwy mapy OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        
        console.log('Mapa załadowana poprawnie!');
    } else {
        console.error('Nie znaleziono elementu mapy!');
    }
    
    // Obsługa nawigacji między zakładkami
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
            } else {
                console.error('Nie znaleziono sekcji:', targetId);
            }
        });
    });
    
    // Sprawdź czy jest ustawiona domyślna aktywna sekcja
    if (!document.querySelector('.content-section.active')) {
        // Jeśli nie, ustaw pierwszą sekcję jako aktywną
        let firstSection = document.querySelector('.content-section');
        if (firstSection) {
            firstSection.classList.add('active');
        }
        
        // Ustaw pierwszy element menu jako aktywny
        let firstMenuItem = document.querySelector('.menu-item');
        if (firstMenuItem) {
            firstMenuItem.classList.add('active');
        }
    }
    
    // Obsługa przejścia do logowania z sekcji dodawania
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
    
    // Obsługa zakładek w sekcji logowania/rejestracji
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
    
    // Obsługa formularza logowania
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Tworzymy dane do wysłania
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('action', 'login');
            
            // Wysyłamy dane do serwera
            fetch('login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Logowanie udane - odświeżamy stronę lub przekierowujemy
                    showNotification(data.message, 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    // Logowanie nieudane - wyświetlamy błąd
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Błąd:', error);
                showNotification('Wystąpił błąd podczas logowania', 'error');
            });
        });
    }
    
    // Obsługa formularza rejestracji
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
            
            // Tworzymy dane do wysłania
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('password_confirm', passwordConfirm);
            
            // Wysyłamy dane do serwera
            fetch('register.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Rejestracja udana - pokazujemy komunikat i przełączamy na formularz logowania
                    showNotification(data.message, 'success');
                    
                    // Czyścimy formularz rejestracji
                    registerForm.reset();
                    
                    // Przełączamy na zakładkę logowania
                    setTimeout(() => {
                        document.querySelector('.auth-tab-btn[data-tab="login-form"]').click();
                    }, 1000);
                } else {
                    // Rejestracja nieudana - wyświetlamy błąd
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Błąd:', error);
                showNotification('Wystąpił błąd podczas rejestracji', 'error');
            });
        });
    }
    
    // Obsługa przycisku wylogowania
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            fetch('logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showNotification(data.message, 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showNotification('Wystąpił błąd podczas wylogowywania', 'error');
                }
            })
            .catch(error => {
                console.error('Błąd:', error);
                showNotification('Wystąpił błąd podczas wylogowywania', 'error');
            });
        });
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
                notificationContainer.removeChild(notification);
                
                // Jeśli nie ma więcej powiadomień, usuwamy kontener
                if (notificationContainer.childNodes.length === 0) {
                    document.body.removeChild(notificationContainer);
                }
            }, 500);
        }, 5000);
    }
    
    // Sprawdzamy czy użytkownik jest zalogowany i aktualizujemy interfejs
    function checkLoginStatus() {
        fetch('check_login.php')
        .then(response => response.json())
        .then(data => {
            const userStatusElement = document.getElementById('user-status');
            if (userStatusElement) {
                if (data.logged_in) {
                    userStatusElement.innerHTML = `<span>Zalogowano jako: ${data.email} (${data.role})</span>`;
                    
                    // Pokazujemy formularz dodawania miejsca, jeśli użytkownik jest zalogowany
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
                        form.style.display = 'none';
                    });
                    
                    const userProfile = document.getElementById('user-profile');
                    if (userProfile) {
                        userProfile.style.display = 'block';
                        
                        const profileUsername = document.getElementById('profile-username');
                        if (profileUsername) {
                            profileUsername.textContent = data.username || data.email;
                        }
                        
                        const profileEmail = document.getElementById('profile-email');
                        if (profileEmail) {
                            profileEmail.textContent = data.email;
                        }
                        
                        const profileRole = document.getElementById('profile-role');
                        if (profileRole) {
                            profileRole.textContent = data.role === 'admin' ? 'Administrator' : 'Użytkownik';
                        }
                    }
                }
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
        });
    }
    
    // Wywołujemy funkcję sprawdzającą status logowania
    checkLoginStatus();
});