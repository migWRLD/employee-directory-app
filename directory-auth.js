

async function requireLogin() {
    const {
        data: { user }
    } = await miguelSupabaseClient.auth.getUser();

    if (!user) {
        window.location.replace('index.html');
    }
}

requireLogin();

const logoutButton =
    document.querySelector('#logout-button');

if (logoutButton) {
    logoutButton.addEventListener(
        'click',
        async () => {
            await miguelSupabaseClient.auth.signOut();
            window.location.href =
                'index.html';
        }
    );
}