var icons: { [key: string]: string } = {
  "link-outline": "M17.5 6c.3 0 .6.1.8.3.4.5.4 1.1 0 1.6l-1.7 1.7.3.3c.5.6.9 1.4.9 2.2s-.4 1.6-1 2.2l-4.1 4.2c-.6.5-1.4.9-2.2.9s-1.6-.4-2.2-1l-.3-.2-1.7 1.7a1 1 0 0 1-1.6 0c-.4-.5-.4-1.1 0-1.6l1.7-1.7-.3-.3c-.5-.6-.9-1.4-.9-2.2s.4-1.6 1-2.2l4.1-4.2c.6-.5 1.4-.8 2.2-.8s1.6.3 2.2.8l.3.3 1.7-1.7c.2-.2.5-.3.8-.3m0-2a3 3 0 0 0-2.2 1l-.5.4a5.2 5.2 0 0 0-5.9 1l-4.2 4a5 5 0 0 0-1 6l-.4.5a3 3 0 0 0 0 4.4 3 3 0 0 0 4.4 0l.5-.5a5 5 0 0 0 5.9-1l4.2-4a5 5 0 0 0 1-6l.4-.5a3 3 0 0 0 0-4.4 3 3 0 0 0-2.2-.9zm-6.1 7.2a2 2 0 0 0 2 2L11.6 15a2 2 0 0 0-2-2l1.8-1.8M12.5 9c-.2 0-.5.1-.6.3l-4.2 4.2c-.2.1-.3.4-.3.6 0 .2.1.5.3.6l.3.3.7-.7a1 1 0 0 1 1.6 0c.4.5.4 1.1 0 1.6l-.7.7.3.3c.1.2.4.3.6.3l.6-.3 4.2-4.2c.2-.1.3-.4.3-.6 0-.2-.1-.5-.3-.6l-.3-.3-.7.7a1 1 0 0 1-1.6 0c-.4-.5-.4-1.1 0-1.6l.7-.7-.3-.3a.9.9 0 0 0-.6-.3z",
  "camera-outline": "M19 20h-14c-1.6 0-3-1.3-3-3v-8c0-1.6 1.3-3 3-3h1.5l1-1c.5-.5 1.5-1 2.4-1h4c.8 0 1.8.4 2.4 1l1 1h1.5c1.6 0 3 1.3 3 3v8c0 1.6-1.3 3-3 3zm-14-12c-.5 0-1 .4-1 1v8c0 .5.4 1 1 1h14c.5 0 1-.4 1-1v-8c0-.5-.4-1-1-1h-2c-.2 0-.52-.1-.7-.2l-1.2-1.2c-.2-.2-.7-.4-1-.4h-4c-.2 0-.7.2-1 .4l-1.2 1.2c-.1.1-.4.2-.7.2h-2zM12 10c1.3 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5m0-1c-1.9 0-3.5 1.5-3.5 3.5 0 1.9 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5c0-1.9-1.5-3.5-3.5-3.5zM18 8.6c-.7 0-1.3.5-1.3 1.3s.5 1.2 1.3 1.2 1.3-.58 1.3-1.2-.5-1.3-1.3-1.3z",
  "image-outline": "M8.5 7.9c.8 0 1.5.6 1.5 1.5s-.6 1.5-1.5 1.5-1.5-.6-1.5-1.5.6-1.5 1.5-1.5m0-1c-1.3 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5zM16 11.9c.45.0 1.27 1.8 1.7 4.0h-11.3c.4-1.0 1.0-2.0 1.6-2.0.8 0 1.1.1 1.53.42.4.2 1.0.58 1.97.58 1.1 0 1.9-.8 2.6-1.6.6-.6 1.2-1.3 1.8-1.3m0-1c-2 0-3 3-4.5 3s-1.4-1-3.5-1c-2 0-3.0 4-3.0 4h14.0s-1-6-3-6zM22 6c0-1.1-.8-2-2-2h-16c-1.1 0-2 .8-2 2v12c0 1.1.8 2 2 2h16c1.1 0 2-.8 2-2v-12zm-2 12h-16v-12h16.0l-.0 12z",
  "download-outline": "M20.9 17c0-.1-.0-.2-.0-.3l-2-6c-.1-.4-.5-.6-.9-.6h-.5l.6-.6c1.17-1.17 1.17-3.0 0-4.2-.81-.8-2.0-1.0-3.1-.7v-1.3c0-1.6-1.3-3-3-3s-3 1.3-3 3v1.3c-1.0-.3-2.3-.1-3.1.7-1.17 1.17-1.17 3.0.0 4.2l.68.6h-.5c-.4 0-.8.2-.9.6l-2 6c-.0.1-.0.2-.0.3-.0 0-.0 5-.0 5 0 .5.4 1 1 1h16c.5 0 1-.4 1-1 0 0 0-5-.0-5zm-13.6-10.5c.1-.1.4-.2.7-.2s.5.1.7.2l2.2 2.2v-5.7c0-.5.4-1 1-1s1 .4 1 1v5.7l2.2-2.2c.3-.3 1.0-.3 1.4 0 .3.39.3 1.0.0 1.4l-4.7 4.6-4.7-4.6c-.3-.3-.3-1.0 0-1.4zm-.5 5.5h1.8l3.4 3.41 3.4-3.41h1.8l1.6 5h-13.8l1.6-5zm12.2 9h-14v-3h14v3z",
  "document-add": "M15 12h-2v-2c0-.5-.4-1-1-1s-1 .4-1 1v2h-2c-.5 0-1 .4-1 1s.4 1 1 1h2v2c0 .5.4 1 1 1s1-.4 1-1v-2h2c.5 0 1-.4 1-1s-.4-1-1-1zM19.7 7.2l-4-4c-.1-.1-.4-.2-.7-.2h-8c-1.6 0-3 1.3-3 3v12c0 1.6 1.3 3 3 3h10c1.6 0 3-1.3 3-3v-10c0-.2-.1-.52-.2-.7zm-2.1.7h-1.0c-.8 0-1.5-.6-1.5-1.5v-1.0l2.5 2.5zm-.5 11h-10c-.5 0-1-.4-1-1v-12c0-.5.4-1 1-1h7v1.5c0 1.3 1.1 2.5 2.5 2.5h1.5v9c0 .5-.4 1-1 1z",
  "home-outline": "M22.2 10.4c-3.39-2.8-9.5-8.1-9.6-8.2l-.6-.5-.6.5c-.0.0-6.2 5.3-9.66 8.2-.4.3-.6.9-.6 1.5 0 1.1.8 2 2 2h1v6c0 1.1.8 2 2 2h12c1.1 0 2-.8 2-2v-6h1c1.1 0 2-.8 2-2 0-.5-.2-1.1-.7-1.5zm-8.2 9.5h-4v-5h4v5zm4-8l.0 8h-3.0v-6h-6v6h-3v-8h-3.0c2.7-2.3 7.3-6.2 9.0-7.68 1.6 1.4 6.2 5.3 9 7.6l-3-.0z",
  trash: "M18 7h-1v-1c0-1.1-.8-2-2-2h-7c-1.1 0-2 .8-2 2v1h-1c-.5 0-1 .4-1 1s.4 1 1 1v8c0 2.2 1.7 4 4 4h5c2.2 0 4-1.7 4-4v-8c.5 0 1-.4 1-1s-.4-1-1-1zm-10-1h7v1h-7v-1zm8 11c0 1.1-.8 2-2 2h-5c-1.1 0-2-.8-2-2v-8h9v8zM8.5 10.5c-.2 0-.5.2-.5.5v6c0 .2.2.5.5.5s.5-.2.5-.5v-6c0-.2-.2-.5-.5-.5zM10.5 10.5c-.2 0-.5.2-.5.5v6c0 .2.2.5.5.5s.5-.2.5-.5v-6c0-.2-.2-.5-.5-.5zM12.5 10.5c-.2 0-.5.2-.5.5v6c0 .2.2.5.5.5s.5-.2.5-.5v-6c0-.2-.2-.5-.5-.5zM14.5 10.5c-.2 0-.5.2-.5.5v6c0 .2.2.5.5.5s.5-.2.5-.5v-6c0-.2-.2-.5-.5-.5z",
  plus: "M18 10h-4v-4c0-1.1-.8-2-2-2s-2 .8-2 2l.0 4h-4.0c-1.1 0-2 .8-2 2s.8 2 2 2l4.0-.0-.0 4.0c0 1.1.8 2 2 2s2-.8 2-2v-4.0l4 .0c1.1 0 2-.8 2-2s-.8-2-2-2z",
  equals: "M18 7h-12c-1.1 0-2 .8-2 2s.8 2 2 2h12c1.1 0 2-.8 2-2s-.8-2-2-2zM18 14h-12c-1.1 0-2 .8-2 2s.8 2 2 2h12c1.1 0 2-.8 2-2s-.8-2-2-2z",
  minus: "M18 11h-12c-1.1 0-2 .8-2 2s.8 2 2 2h12c1.1 0 2-.8 2-2s-.8-2-2-2z",
  'info-outline': 'M14.2 16l.6-1c.8-1.7.9-3.3.2-4.6a4 4 0 0 0-.4-.7 4 4 0 1 0-5-1.6 6.7 6.7 0 0 0-3 1.4A2 2 0 0 0 7.9 13l-.6 1c-.8 1.7-.9 3.3-.2 4.6.5 1.2 1.6 2 3 2.3a6.3 6.3 0 0 0 5.3-1.4 2 2 0 0 0-1-3.5zM13 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-1.8 15h-.9C8.7 18.5 8 17 9 15l1-2c.5-1 .5-1.6-.1-2-.2-.2-.4-.2-.7-.2L8 11s1.1-1 2.8-1h.9c1.6.4 2.3 2 1.3 4l-1 2c-.5 1-.5 1.6.1 2 .2.2.4.2.7.2L14 18s-1.1 1-2.8 1z',
  'document-text': 'M17 21H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3zM7 5a1 1 0 0 0-1 1v12c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V6c0-.6-.4-1-1-1H7zm9 6H8a.5.5 0 0 1 0-1h8a.5.5 0 0 1 0 1zm0-3H8a.5.5 0 0 1 0-1h8a.5.5 0 0 1 0 1zm0 6H8a.5.5 0 0 1 0-1h8a.5.5 0 0 1 0 1zm0 3H8a.5.5 0 0 1 0-1h8a.5.5 0 0 1 0 1z',
  'arrow-down-outline': 'M12 21.312l-7.121-7.121c-1.17-1.17-1.17-3.073 0-4.242 1.094-1.094 2.978-1.138 4.121-.115v-4.834c0-1.654 1.346-3 3-3s3 1.346 3 3v4.834c1.143-1.023 3.027-.979 4.121.115 1.17 1.169 1.17 3.072 0 4.242l-7.121 7.121zm-5-10.242c-.268 0-.518.104-.707.293-.391.39-.391 1.023 0 1.414l5.707 5.707 5.707-5.707c.391-.391.391-1.024 0-1.414-.379-.379-1.035-.379-1.414 0l-3.293 3.293v-9.656c0-.551-.448-1-1-1s-1 .449-1 1v9.656l-3.293-3.293c-.189-.189-.439-.293-.707-.293z',
  'folder-open': 'M22.3 8h-2.4c-.4-1.2-1.5-2-2.8-2h-6c0-1.1-.9-2-2-2h-4.1c-1.7 0-3 1.3-3 3v10c0 1.7 1.3 3 3 3h12c1.7 0 3.4-1.3 3.8-3l2.2-8c.1-.6-.2-1-.7-1zm-18.3 1v-2c0-.6.4-1 1-1h4c0 1.1.9 2 2 2h6c.6 0 1 .4 1 1h-11.1c-.6 0-1.1.4-1.3 1l-1.6 6.3v-7.3zm14.9 7.5c-.2.8-1.1 1.5-1.9 1.5h-12s-.4-.2-.2-.8l1.9-7c0-.1.2-.2.3-.2h13.7l-1.8 6.5z',
  'weather-cloudy': 'M17 19h-11c-2.2 0-4-1.7-4-4 0-1.8 1.2-3.4 3.0-3.8l-.0-.1c0-3.3 2.6-6 6-6 2.5 0 4.8 1.6 5.65 4.0 2.9-.2 5.35 2.1 5.35 4.9 0 2.7-2.2 5-5 5zm-11.0-6.0c-1.0.0-1.9.9-1.9 2.0s.8 2 2 2h11c1.6 0 3-1.3 3-3s-1.3-3-3-3c-.2 0-.5.0-.81.13l-1.0.3-.1-1.1c-.3-1.9-1.9-3.3-3.9-3.3-2.2 0-4 1.7-4 4 0 .2.0.5.0.8l.2 1.1-1.4-.0z',
};

function Icon(props: { id?: string, shape?: string }) {
    var path = (props.id ? icons[props.id] : props.shape)
    return React.createElement('i', { className: 'icon' },
        React.createElement('svg', {
        version: "1.2",
        baseProfile: "tiny",
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        width: "24",
        height: "24"
        },
            React.createElement('path', { d: path })
        )
    )
}