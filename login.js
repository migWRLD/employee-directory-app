

const loginForm = 
    document.querySelector('#login-form');

const loginMessage =
    document.querySelector('#login-message');

loginForm.addEventListener(
    'submit',
    async (event) => {
        event.preventDefault();

        const email = 
            document.querySelector('#email')
                .value
                .trim();

        const password =
            document.querySelector('#password')
                .value;

        loginMessage.textContent = 
        
            'Logging in...';

        const { error } = 

            await miguelSupabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                loginMessage.textContent =
                    'Invalid email or password';
                return;

            }

            window.location.href =
                'directory.html';
    }
);

