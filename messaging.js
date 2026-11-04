
const conversation =
    document.querySelector('#conversation');

const messageForm =
    document.querySelector('#message-form');

const messageComposer =
    document.querySelector('#message-composer');

const messageStatus =
    document.querySelector('#message-status');

const recipientName =
    document.querySelector('#recipient-name');

const recipientId =
    new URLSearchParams(window.location.search)
        .get('recipient');

let currentUser = null;
let chatReady = false;
const sendButton = messageForm.querySelector('button[type="submit"]');
sendButton.disabled = true;

async function loadChat() {
    if (!recipientId) {
        messageStatus.textContent =
            'No employee was selected.';
        return;
    }

    const {
        data: { user },
        error: userError
    } = await miguelSupabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.href = 'chat-login.html?recipient=' + encodeURIComponent(recipientId);
        return;
    }

    currentUser = user;

    const {
        data: recipient,
        error: recipientError
    } = await miguelSupabaseClient
        .from('profiles')
        .select('id, display_name, email')
        .eq('id', recipientId)
        .single();

    if (recipientError || !recipient) {
        messageStatus.textContent =
            'The employee could not be found.';
        return;
    }

    recipientName.textContent =
        recipient.display_name;

    subscribeToMessages();
    await loadMessages();

    chatReady = true;
    sendButton.disabled = false;
    messageComposer.focus();
}

async function loadMessages() {
    const { data, error } =
        await miguelSupabaseClient
            .from('messages')
            .select('*')
            .or(
                `and(sender_id.eq.${currentUser.id},recipient_id.eq.${recipientId}),` +
                `and(sender_id.eq.${recipientId},recipient_id.eq.${currentUser.id})`
            )
            .order('created_at', {
                ascending: true
            });

    if (error) {
        messageStatus.textContent =
            'Messages could not load.';
        return;
    }

    conversation.replaceChildren();

    data.forEach(displayMessage);
}

function displayMessage(message) {
    const messageElement =
        document.createElement('p');

    messageElement.textContent =
        message.body;

    if (message.sender_id === currentUser.id) {
        messageElement.className = 'sent-message';
    } else {
        messageElement.className = 'received-message';
    }

    conversation.appendChild(messageElement);
}

messageForm.addEventListener('submit', async event => {
    event.preventDefault();

    const body =
        messageComposer.value.trim();

    if (!body || !chatReady) {
        return;
    }

    messageStatus.textContent =
        'Sending...';

    const { error } =
        await miguelSupabaseClient
            .from('messages')
            .insert({
                sender_id: currentUser.id,
                recipient_id: recipientId,
                body
            });

    if (error) {
        messageStatus.textContent =
            'Message could not be sent.';
        console.error(error);
        return;
    }

    messageComposer.value = '';

    messageStatus.textContent =
        'Message sent.';
});

document
    .querySelectorAll('[data-prompt]')
    .forEach(button => {
        button.addEventListener('click', () => {
            messageComposer.value =
                button.dataset.prompt;

            messageComposer.focus();
        });
    });

function subscribeToMessages() {
    miguelSupabaseClient
        .channel('private-messages')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            },
            payload => {
                const message =
                    payload.new;

                const belongsToChat =
                    (
                        message.sender_id === currentUser.id &&
                        message.recipient_id === recipientId
                    ) ||
                    (
                        message.sender_id === recipientId &&
                        message.recipient_id === currentUser.id
                    );

                if (belongsToChat) {
                    displayMessage(message);
                }
            }
        )
        .subscribe();
}

loadChat();