let currentTab = 'player';

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    currentTab = tabName;
    
    if (tabName === 'media') {
        loadMediaLibrary();
    }
}

// Player functionality
function loadStream() {
    const streamKey = document.getElementById('streamKey').value;
    const video = document.getElementById('video');
    
    if (!streamKey) {
        alert('Please enter a stream key');
        return;
    }
    
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(`/hls/${streamKey}.m3u8`);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play();
            updateStreamStatus(streamKey, 'playing');
        });
        
        // Update viewer count every 5 seconds
        setInterval(() => {
            updateStreamStatus(streamKey);
        }, 5000);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = `/hls/${streamKey}.m3u8`;
        video.addEventListener('loadedmetadata', () => {
            video.play();
            updateStreamStatus(streamKey, 'playing');
        });
    }
}

async function updateStreamStatus(streamKey, action = '') {
    try {
        const response = await fetch(`/api/streams/status/${streamKey}`);
        const data = await response.json();
        
        document.getElementById('status').innerHTML = 
            `Status: ${data.status} | Viewers: ${data.viewers}`;
            
        if (action === 'playing') {
            // Notify backend about viewer
            await fetch(`/api/streams/viewer/${streamKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'join' })
            });
        }
    } catch (error) {
        console.error('Status update error:', error);
    }
}

// Upload functionality (без авторизации)
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('uploadStatus');
    
    if (!fileInput.files.length) {
        statusDiv.innerHTML = 'Please select a file';
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    try {
        statusDiv.innerHTML = 'Uploading...';
        
        // Убираем заголовок Authorization
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            statusDiv.innerHTML = 'Upload successful!';
            fileInput.value = '';
            loadMediaLibrary();
        } else {
            statusDiv.innerHTML = `Upload failed: ${result.error}`;
        }
    } catch (error) {
        statusDiv.innerHTML = `Upload error: ${error.message}`;
    }
}

// Media library functionality (без авторизации)
async function loadMediaLibrary() {
    try {
        const response = await fetch('/api/upload');
        const data = await response.json();
        const mediaList = document.getElementById('mediaList');
        
        if (data.media && data.media.length > 0) {
            mediaList.innerHTML = data.media.map(media => `
                <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
                    <h4>${media.original_name}</h4>
                    <p>Size: ${(media.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    <p>Uploaded: ${new Date(media.uploaded_at).toLocaleDateString()}</p>
                    <a href="${media.s3_url}" target="_blank" style="margin-right: 10px;">View</a>
                    <button onclick="deleteMedia(${media.id})">Delete</button>
                </div>
            `).join('');
        } else {
            mediaList.innerHTML = '<p>No media files uploaded yet.</p>';
        }
    } catch (error) {
        console.error('Media load error:', error);
        document.getElementById('mediaList').innerHTML = '<p>Error loading media library</p>';
    }
}

// Delete media (без авторизации)
async function deleteMedia(mediaId) {
    if (!confirm('Are you sure you want to delete this media?')) return;
    
    try {
        const response = await fetch(`/api/upload/${mediaId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Media deleted successfully');
            loadMediaLibrary();
        } else {
            alert('Delete failed: ' + result.error);
        }
    } catch (error) {
        alert('Delete error: ' + error.message);
    }
}

// Stream creation (если нужно)
async function createStream() {
    const streamName = document.getElementById('newStreamName').value;
    
    if (!streamName) {
        alert('Please enter a stream name');
        return;
    }
    
    try {
        const response = await fetch('/api/streams/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: streamName })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Stream created! Use this key: ${result.streamKey}`);
        } else {
            alert('Stream creation failed: ' + result.error);
        }
    } catch (error) {
        alert('Stream creation error: ' + error.message);
    }
}
