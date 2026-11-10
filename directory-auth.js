const LOGIN_PAGE = 'chat-login.html';

async function requireLogin() {
    if (!window.miguelSupabaseClient) {
        console.error(
            'Miguel Supabase client was not loaded.'
        );
        return;
    }

    const {
        data: { user },
        error
    } = await miguelSupabaseClient.auth.getUser();

    if (error || !user) {
        window.location.replace(LOGIN_PAGE);
        return;
    }

    const logoutButton =
        document.querySelector('#logout-button');

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener('click', async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = 'Logging out...';

        const { error: logoutError } =
            await miguelSupabaseClient.auth.signOut();

        if (logoutError) {
            console.error(
                'Logout failed:',
                logoutError
            );

            logoutButton.disabled = false;
            logoutButton.textContent = 'Log Out';
            return;
        }

        window.location.replace(LOGIN_PAGE);
    });
}

requireLogin();

