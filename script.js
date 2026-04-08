document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const connectBtn = document.getElementById('connectBtn');
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');
    
    // UI elements to hide on success
    const authElements = [
        document.querySelector('.auth-header'),
        document.querySelector('.social-login'),
        document.querySelector('.divider'),
        form
    ];

    function showSuccess() {
        authElements.forEach(el => {
            if(el) el.style.display = 'none';
        });
        successMsg.style.display = 'block';
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([100, 50, 100]); // Success vibration pattern
        }
    }

    // Export function to global scope for social buttons
    window.simulateConn = function(provider) {
        // --- IMPLEMENTACIÓN REAL DE PORTAL CAUTIVO ---
        // 1. Necesitas configurar el "Walled Garden" en tu router (MikroTik, Ubiquiti, etc.)
        //    para permitir el tráfico libre hacia accounts.google.com y appleid.apple.com.
        // 2. Aquí llamarías a tu backend (o Firebase Auth) para procesar el OAuth.
        // Ejemplo: window.location.href = `https://tu-backend.com/auth/${provider.toLowerCase()}`;
        
        // Para esta prueba local, simularemos una ventana de autenticación real (Popup OAuth):
        const authWindow = window.open('', '_blank', 'width=450,height=550,top=100,left=100');
        
        if (authWindow) {
            authWindow.document.write(`
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 40px;">
                    <h2>Conectando con ${provider}...</h2>
                    <p>Por favor espera mientras se verifica tu identidad.</p>
                </div>
            `);
            
            // Simulamos que el usuario completa el inicio de sesión en la otra ventana
            setTimeout(() => {
                authWindow.close();
                document.body.style.cursor = 'wait';
                
                // Procesando token y autorizando el Wi-Fi...
                setTimeout(() => {
                    document.body.style.cursor = 'default';
                    showSuccess();
                }, 1000);
            }, 2500); // 2.5 segundos simulando el tiempo que tarda el usuario en la ventana
        } else {
            alert('Por favor, permite las ventanas emergentes (pop-ups) para iniciar sesión con ' + provider);
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const terms = document.getElementById('terms').checked;
        
        if (!fullName || !email || !terms) {
            errorMsg.textContent = 'Por favor completa todos los campos.';
            errorMsg.style.display = 'block';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorMsg.textContent = 'Ingresa un correo electrónico válido.';
            errorMsg.style.display = 'block';
            return;
        }

        connectBtn.classList.add('loading');
        Array.from(form.elements).forEach(element => element.disabled = true);
        
        // Disable social buttons too
        document.querySelectorAll('.btn-social').forEach(btn => btn.disabled = true);

        setTimeout(() => {
            connectBtn.classList.remove('loading');
            showSuccess();
        }, 2000);
    });

    // Modal declarations and events
    const linkTerms = document.getElementById('linkTerms');
    const linkPrivacy = document.getElementById('linkPrivacy');
    const infoModal = document.getElementById('infoModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const termsContent = `
        <p>Al acceder a esta red Wi-Fi gratuita, aceptas someterte a los presentes Términos de Uso.</p>
        <h3>1. Uso Aceptable</h3>
        <p>Te comprometes a no utilizar este servicio para actividades ilegales, envío de spam, o para descargar contenido protegido por derechos de autor sin autorización.</p>
        <h3>2. Limitación de Responsabilidad</h3>
        <p>Este servicio se proporciona "tal cual" sin ninguna garantía. No somos responsables por ninguna pérdida de datos, intercepción de información o daños derivados del uso de esta red.</p>
        <h3>3. Duración del Acceso</h3>
        <p>El acceso se otorga por un período limitado de 24 horas. Después de este tiempo, requerirás una nueva autenticación.</p>
    `;

    const privacyContent = `
        <p>Nuestros estándares de proyección de privacidad garantizan el manejo seguro de tus datos.</p>
        <h3>1. Recopilación de Datos</h3>
        <p>Recopilamos únicamente tu nombre y correo electrónico (o identificador de red social) para fines de autenticación y seguridad en la red.</p>
        <h3>2. Uso de la Información</h3>
        <p>Tus datos no serán vendidos ni compartidos con terceros con fines comerciales. Se utilizan exclusivamente para brindar acceso al servicio de conectividad.</p>
        <h3>3. Estándares de Seguridad</h3>
        <p>La información viaja cifrada y se almacena en entornos seguros siguiendo las normas vigentes de protección de datos. No monitoreamos el contenido de tu navegación privada.</p>
    `;

    function openModal(title, content) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        infoModal.style.display = 'flex';
        // Retardo para la transición CSS
        setTimeout(() => infoModal.classList.add('active'), 10);
    }

    function closeInfoModal() {
        infoModal.classList.remove('active');
        setTimeout(() => infoModal.style.display = 'none', 300);
    }

    if(linkTerms) {
        linkTerms.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('Términos de Uso', termsContent);
        });
    }

    if(linkPrivacy) {
        linkPrivacy.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('Políticas de Seguridad y Privacidad', privacyContent);
        });
    }

    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', closeInfoModal);
    }

    if(infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) closeInfoModal();
        });
    }
});
