// Upewniamy się, że DOM jest załadowany przed uruchomieniem skryptu
document.addEventListener('DOMContentLoaded', function() {
    // Zmienne globalne
    var map;
    var markers = [];
    var isUserLoggedIn = false;
    
    // Inicjalizacja mapy
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
    
    // Funkcja ładująca miejsca z bazy danych
    function loadPlaces() {
        fetch('get_places.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Usuń istniejące markery
                markers.forEach(marker => map.removeLayer(marker));
                markers = [];
                
                // Dodaj nowe markery
                data.data.forEach(place => {
                    const marker = L.marker([place.szerokosc, place.dlugosc]).addTo(map);
                    
                    // Zawartość popupu
                    let popupContent = `<strong>${place.nazwa}</strong>`;
                    if (place.opis) {
                        popupContent += `<p>${place.opis}</p>`;
                    }
                    if (place.zdjecie) {
                        popupContent += `<img src="${place.zdjecie}" alt="${place.nazwa}" style="max-width: 200px; max-height: 150px;">`;
                    }
                    
                    marker.bindPopup(popupContent);
                    markers.push(marker);
                });
            } else {
                showNotification('Błąd podczas wczytywania miejsc', 'error');
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
            showNotification('Wystąpił błąd podczas wczytywania miejsc', 'error');
        });
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
    
    // Obsługa formularza dodawania miejsca
    const addPlaceForm = document.getElementById('add-place-form');
if (addPlaceForm) {
    addPlaceForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const placeName = document.getElementById('place-name').value;
        const placeDesc = document.getElementById('place-desc').value;
        const placeLat = document.getElementById('place-lat').value;
        const placeLng = document.getElementById('place-lng').value;
        const placePhotos = document.getElementById('place-photos').files;
        
        // Tworzymy dane do wysłania
        const formData = new FormData();
        formData.append('name', placeName);
        formData.append('description', placeDesc);
        formData.append('latitude', placeLat);
        formData.append('longitude', placeLng);
        
        // Dodajemy pliki jeśli są
        if (placePhotos.length > 0) {
            for (let i = 0; i < placePhotos.length; i++) {
                formData.append('photos[]', placePhotos[i]);
            }
        }
            
            // Walidacja podstawowa
            if (!name || !lat || !lng) {
                showNotification('Wypełnij wszystkie wymagane pola', 'error');
                return;
            }
            
            // Tworzymy dane do wysłania
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('lat', lat);
            formData.append('lng', lng);
            
            // Dodajemy zdjęcia, jeśli są
            if (photosInput.files.length > 0) {
                formData.append('photo', photosInput.files[0]);
            }
            
            // Wysyłamy dane do serwera
        fetch('add_place.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification(data.message, 'success');
                
                // Dodajemy nowy marker na mapie
                if (map && placeLat && placeLng) {
                    L.marker([placeLat, placeLng])
                     .addTo(map)
                     .bindPopup(`<strong>${placeName}</strong><br>${placeDesc}`);
                }
                
                // Czyścimy formularz
                addPlaceForm.reset();
                
                // Jeśli były ostrzeżenia dotyczące przesyłania plików
                if (data.uploadWarnings && data.uploadWarnings.length > 0) {
                    data.uploadWarnings.forEach(warning => {
                        showNotification(warning, 'warning');
                    });
                }
            } else {
                // Dodanie nieudane - wyświetlamy błąd
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
            showNotification('Wystąpił błąd podczas dodawania miejsca', 'error');
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
                    isUserLoggedIn = true;
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
                        form.classList.remove('active');
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
                } else {
                    isUserLoggedIn = false;
                }
            }
        })
        .catch(error => {
            console.error('Błąd:', error);
        });
    }
    
    // Wywołujemy funkcję sprawdzającą status logowania
    checkLoginStatus();
    
    // Ładujemy miejsca z bazy danych
    if (map) {
        loadPlaces();
    }
    // Funkcje obsługi lightboxa dla zdjęć
function initializeLightbox() {
    console.log('Inicjalizacja lightboxa');
    
    // Pobierz elementy lightboxa
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeButton = document.querySelector('.close-lightbox');
    const prevButton = document.getElementById('prev-image');
    const nextButton = document.getElementById('next-image');
    
    // Zmienna przechowująca aktualny indeks obrazu w galerii
    let currentImageIndex = 0;
    // Zmienna przechowująca listę obrazów w aktualnej galerii
    let currentGallery = [];
    
    // Dodaj obsługę kliknięcia na obrazy
    function setupImageClickHandlers() {
        // Pobieramy wszystkie zdjęcia z atrybutem data-lightbox
        const clickableImages = document.querySelectorAll('img[data-lightbox]');
        
        clickableImages.forEach((image, index) => {
            // Dodaj klasę dla wskazania, że obraz jest klikalny
            image.classList.add('clickable-image');
            
            // Dodaj obsługę kliknięcia
            image.addEventListener('click', function() {
                // Pobierz galerię, do której należy obraz
                const galleryName = this.getAttribute('data-lightbox') || 'default';
                
                // Znajdź wszystkie obrazy z tej samej galerii
                currentGallery = Array.from(document.querySelectorAll(`img[data-lightbox="${galleryName}"]`));
                
                // Ustaw indeks aktualnego obrazu
                currentImageIndex = currentGallery.indexOf(this);
                
                // Pokaż obraz w lightboxie
                openLightbox(this.src, this.alt);
            });
        });
    }
    
    // Otwieranie lightboxa
    function openLightbox(src, alt) {
        if (!lightbox) return;
        
        lightboxImage.src = src;
        lightboxImage.alt = alt || 'Powiększone zdjęcie';
        
        // Pokaż lightbox
        lightbox.classList.add('active');
        
        // Zablokuj przewijanie strony
        document.body.style.overflow = 'hidden';
        
        // Aktualizuj widoczność przycisków nawigacji
        updateNavigationButtons();
    }
    
    // Zamykanie lightboxa
    function closeLightbox() {
        if (!lightbox) return;
        
        lightbox.classList.remove('active');
        
        // Odblokuj przewijanie strony
        document.body.style.overflow = '';
        
        // Zresetuj źródło obrazu po zakończeniu animacji
        setTimeout(() => {
            lightboxImage.src = '';
        }, 300);
    }
    
    // Nawigacja do poprzedniego obrazu
    function showPreviousImage() {
        if (currentGallery.length <= 1) return;
        
        currentImageIndex--;
        if (currentImageIndex < 0) {
            currentImageIndex = currentGallery.length - 1; // Przejdź do ostatniego obrazu
        }
        
        const prevImage = currentGallery[currentImageIndex];
        if (prevImage) {
            lightboxImage.src = prevImage.src;
            lightboxImage.alt = prevImage.alt || 'Powiększone zdjęcie';
        }
        
        updateNavigationButtons();
    }
    
    // Nawigacja do następnego obrazu
    function showNextImage() {
        if (currentGallery.length <= 1) return;
        
        currentImageIndex++;
        if (currentImageIndex >= currentGallery.length) {
            currentImageIndex = 0; // Przejdź do pierwszego obrazu
        }
        
        const nextImage = currentGallery[currentImageIndex];
        if (nextImage) {
            lightboxImage.src = nextImage.src;
            lightboxImage.alt = nextImage.alt || 'Powiększone zdjęcie';
        }
        
        updateNavigationButtons();
    }
    
    // Aktualizacja widoczności przycisków nawigacji
    function updateNavigationButtons() {
        // Pokaż przyciski nawigacji tylko jeśli jest więcej niż jeden obraz w galerii
        const showNav = currentGallery.length > 1;
        prevButton.style.display = showNav ? 'flex' : 'none';
        nextButton.style.display = showNav ? 'flex' : 'none';
    }
    
    // Dodaj obsługę zdarzeń
    if (closeButton) {
        closeButton.addEventListener('click', closeLightbox);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', showPreviousImage);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', showNextImage);
    }
    
    // Zamykanie lightboxa po kliknięciu poza obrazem
    if (lightbox) {
        lightbox.addEventListener('click', function(event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Obsługa klawiszy
    document.addEventListener('keydown', function(event) {
        if (!lightbox.classList.contains('active')) return;
        
        switch (event.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });
    
    // Inicjalizacja klikania na obrazy
    setupImageClickHandlers();
    
    // Obserwuj zmiany w DOM, aby dodać obsługę kliknięcia dla nowo dodanych obrazów
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                setTimeout(setupImageClickHandlers, 100);
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Eksponuj publiczną funkcję do otwierania lightboxa
    window.openImageLightbox = function(src, alt) {
        openLightbox(src, alt);
    };
    
    console.log('Lightbox zainicjalizowany');
}

// Dodaj funkcję do rozszerzenia obsługi zdjęć w markerach
function enhanceMapMarkerImages() {
    // Funkcja do dostosowania zawartości popupu markera po jego otwarciu
    function setupPopupContent(popup) {
        const images = popup.getElement().querySelectorAll('img');
        
        images.forEach((img, index) => {
            if (!img.hasAttribute('data-lightbox')) {
                // Dodaj atrybuty do zdjęć, aby działały z lightboxem
                img.setAttribute('data-lightbox', 'map-gallery');
                img.setAttribute('data-index', index);
                img.classList.add('clickable-image');
                
                // Dodaj obsługę kliknięcia
                img.addEventListener('click', function() {
                    window.openImageLightbox(this.src, this.alt || 'Zdjęcie zabytku');
                });
            }
        });
    }
    
    // Jeśli istnieje obiekt mapy, dodaj nasłuchiwanie na otwarcie popupów
    if (window.map) {
        window.map.on('popupopen', function(e) {
            setupPopupContent(e.popup);
        });
    }
}

// Dodaj inicjalizację lightboxa do głównej funkcji po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    const currentInitFunction = window.onload || function(){};
    
    window.onload = function() {
        // Wywołaj dotychczasową funkcję onload
        if (typeof currentInitFunction === 'function') {
            currentInitFunction();
        }
        
        // Inicjalizuj lightbox
        initializeLightbox();
        
        // Dostosuj obsługę zdjęć w markerach mapy
        enhanceMapMarkerImages();
    };
});

// Funkcja pomocnicza do dodawania atrybutu data-lightbox do wszystkich obrazów
function makeAllImagesClickable() {
    document.querySelectorAll('img:not([data-lightbox])').forEach((img, index) => {
        // Pomijamy bardzo małe obrazy (np. ikony)
        if (img.width > 100 || img.height > 100 || 
            img.naturalWidth > 100 || img.naturalHeight > 100 ||
            !img.width) { // dla obrazów bez ustawionej szerokości (ładujących się)
            img.setAttribute('data-lightbox', 'gallery');
            img.classList.add('clickable-image');
        }
    });
}

// Wywołaj funkcję z pewnym opóźnieniem, aby obrazy zdążyły się załadować
setTimeout(makeAllImagesClickable, 1000);
// Funkcja do wyświetlania zdjęć miejsc w markerach
function createMarkerPopupContent(place) {
    let content = `
        <div class="marker-popup">
            <h3>${place.nazwa}</h3>
            <p>${place.opis}</p>
    `;
    
    if (place.zdjecie) {
        // Sprawdź czy to pojedyncze zdjęcie czy wiele (jako JSON)
        try {
            const images = JSON.parse(place.zdjecie);
            if (Array.isArray(images) && images.length > 0) {
                content += `<div class="place-images">`;
                images.forEach((img, index) => {
                    content += `
                        <img src="${img}" 
                             alt="Zdjęcie ${place.nazwa} ${index + 1}" 
                             data-lightbox="place-${place.id}" 
                             class="clickable-image"
                             style="max-width: 150px; margin: 5px;">
                    `;
                });
                content += `</div>`;
            }
        } catch (e) {
            // Jeśli nie jest to JSON, traktuj jako pojedyncze zdjęcie
            content += `
                <img src="${place.zdjecie}" 
                     alt="Zdjęcie ${place.nazwa}" 
                     data-lightbox="place-${place.id}" 
                     class="clickable-image"
                     style="max-width: 200px; margin-top: 10px;">
            `;
        }
    }
    
    content += `
        </div>
    `;
    
    return content;
}
function setupImagePreview() {
    const fileInput = document.getElementById('place-photos');
    if (!fileInput) return;
    
    // Utwórz kontener na podgląd zdjęć, jeśli nie istnieje
    let previewContainer = document.getElementById('photos-preview');
    if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = 'photos-preview';
        previewContainer.className = 'photos-preview';
        previewContainer.style.marginTop = '10px';
        previewContainer.style.display = 'flex';
        previewContainer.style.flexWrap = 'wrap';
        previewContainer.style.gap = '10px';
        
        // Wstaw kontener po elemencie input
        fileInput.parentNode.insertBefore(previewContainer, fileInput.nextSibling);
    }
    
    // Obsługa zmiany plików
    fileInput.addEventListener('change', function() {
        // Wyczyść kontener podglądu
        previewContainer.innerHTML = '';
        
        // Sprawdź, czy zostały wybrane jakieś pliki
        if (this.files && this.files.length > 0) {
            // Iteruj przez wszystkie wybrane pliki
            Array.from(this.files).forEach((file, index) => {
                // Sprawdź, czy plik jest obrazem
                if (!file.type.match('image.*')) return;
                
                // Utwórz element obrazu dla podglądu
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-image-container';
                imgContainer.style.position = 'relative';
                
                const img = document.createElement('img');
                img.className = 'preview-image clickable-image';
                img.setAttribute('data-lightbox', 'form-preview');
                img.style.maxWidth = '150px';
                img.style.maxHeight = '150px';
                img.style.borderRadius = '4px';
                
                // Dodaj przycisk usuwania
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '&times;';
                removeBtn.className = 'remove-image-btn';
                removeBtn.type = 'button';
                removeBtn.style.position = 'absolute';
                removeBtn.style.top = '-10px';
                removeBtn.style.right = '-10px';
                removeBtn.style.backgroundColor = 'rgba(220, 53, 69, 0.8)';
                removeBtn.style.color = 'white';
                removeBtn.style.border = 'none';
                removeBtn.style.borderRadius = '50%';
                removeBtn.style.width = '25px';
                removeBtn.style.height = '25px';
                removeBtn.style.display = 'flex';
                removeBtn.style.justifyContent = 'center';
                removeBtn.style.alignItems = 'center';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.fontSize = '16px';
                removeBtn.style.padding = '0';
                
                // Obsługa usuwania zdjęcia
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    imgContainer.remove();
                    
                    // Aktualizacja wybranych plików jest trudna, więc lepiej 
                    // obsłużyć to przy wysyłaniu formularza
                });
                
                // Wczytaj podgląd obrazu
                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
                
                // Dodaj elementy do kontenera
                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                previewContainer.appendChild(imgContainer);
                
                // Dodaj możliwość podglądu w pełnym ekranie
                img.addEventListener('click', function() {
                    window.openImageLightbox(this.src, `Podgląd zdjęcia ${index + 1}`);
                });
            });
        }
    });
}

// Dodaj funkcję do inicjalizacji przy ładowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    // Wywołanie funkcji setup
    setupImagePreview();
});
// Obsługa formularza dodawania miejsca
const addPlaceForm = document.getElementById('add-place-form');
if (addPlaceForm) {
    addPlaceForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const placeName = document.getElementById('place-name').value;
        const placeDesc = document.getElementById('place-desc').value;
        const placeLat = document.getElementById('place-lat').value;
        const placeLng = document.getElementById('place-lng').value;
        const placePhotos = document.getElementById('place-photos').files;
        
        // Tworzymy dane do wysłania
        const formData = new FormData();
        formData.append('name', placeName);
        formData.append('description', placeDesc);
        formData.append('latitude', placeLat);
        formData.append('longitude', placeLng);
        
        // Dodajemy pliki jeśli są
        if (placePhotos.length > 0) {
            for (let i = 0; i < placePhotos.length; i++) {
                formData.append('photos[]', placePhotos[i]);
            }
        }

    });
}
});