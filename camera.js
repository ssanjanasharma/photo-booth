const video = document.getElementById('camera');
const canvas = document.getElementById('photo-strip');
const ctx = canvas.getContext('2d');
const captureBtn = document.getElementById('capture-btn');
const countdownSelect = document.getElementById('countdown');
const filterButtons = document.querySelectorAll('.filter-buttons button');

// Create preview container
let previewContainer = document.querySelector('.photo-strip-preview');

// Get or create Done button
let doneBtn = document.getElementById('done-btn');
doneBtn.style.display = 'none';

// Create Countdown Overlay
let overlay = document.getElementById('countdown-overlay');
overlay.style.display = 'none';

let currentFilter = 'none';

/** ✅ Dynamically select camera based on device type **/
async function startCamera() {
  try {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: isMobile ? 'user' : 'user', // You can change to 'environment' for rear camera on phones
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    video.srcObject = stream;
    await video.play();
  } catch (err) {
    console.error("Camera error:", err);
  }
}

startCamera();

// Apply filter to video
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.getAttribute('data-filter');
    video.style.filter = currentFilter;
  });
});

// Countdown logic
function showCountdown(seconds, onComplete) {
  let remaining = seconds;
  overlay.textContent = remaining;
  overlay.style.display = 'block';

  const countdownInterval = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      overlay.textContent = remaining;
    } else {
      clearInterval(countdownInterval);
      overlay.style.display = 'none';
      onComplete();
    }
  }, 1000);
}

// Capture 3 photos into canvas and preview
captureBtn.addEventListener('click', () => {
  const countdown = parseInt(countdownSelect.value);
  captureBtn.disabled = true;
  previewContainer.innerHTML = '';
  doneBtn.style.display = 'none';

  let photoIndex = 0;
  const imagesData = [];

  const capturePhoto = () => {
    if (photoIndex >= 3) {
      captureBtn.disabled = false;
      captureBtn.innerText = "Start Capture";
      doneBtn.style.display = 'inline-block';
      return;
    }

    captureBtn.innerText = `Capturing ${photoIndex + 1}/3...`;

    showCountdown(countdown, () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 320;
      tempCanvas.height = 240;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.filter = currentFilter;
      tempCtx.drawImage(video, 0, 0, 320, 240);

      // Draw to main canvas (invisible for now)
      ctx.filter = currentFilter;
      ctx.drawImage(video, 0, photoIndex * 320, 320, 320);

      // Show preview
      const img = document.createElement('img');
      const dataURL = tempCanvas.toDataURL('image/png');
      img.src = dataURL;
      previewContainer.appendChild(img);

      // Save for preview.html
      imagesData.push(dataURL);

      photoIndex++;
      capturePhoto();
    });
  };

  capturePhoto();
});

// Done button logic: Save to localStorage & redirect
doneBtn.addEventListener('click', () => {
  const previewImages = Array.from(previewContainer.querySelectorAll('img')).map(img => img.src);
  localStorage.setItem('photoStripImages', JSON.stringify(previewImages));
  window.location.href = 'preview.html';
});