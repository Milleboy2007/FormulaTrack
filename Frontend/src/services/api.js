const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: 'include',
        ...options,

        headers: {
            'Content-Type': 'application/json',
            ...options.headers, 
        },
    })

    const data = await res.json().catch(() => ({}))

    if(!res.ok) {
        const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message ?? 'Requête échouée'

        const error = new Error(message)
        error.status = res.status
        error.statusText = res.statusText
        throw error
    }

    return data
}

const get = (path) => request(path)
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body)} )
const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body)} )
const patch = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body)} )
const del = (path) => request(path, { method: 'DELETE' } )

// HOME

// COMTPE

// SIGNIN

// SIGNUP

// PROFIL

// EXPLORE

// FAVORIS

// JEU
