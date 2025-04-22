<template>
  <div>
    <!-- Button to Open Modal -->
    <button @click="openModal" class="open-modal-button">
      <span class="icon">🔍</span>
      <span>ກວດສອບ QR Code</span>
    </button>

    <!-- Modal -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content" :class="{ 'modal-scanning': isScanning }">
            <div class="modal-header">
              <h3>ກວດສອບລະຫັດຈາກ QR Code</h3>
              <button class="close-button" @click="closeModal">×</button>
            </div>

            <!-- Scanner -->
            <div id="reader" class="scanner-container"></div>

            <!-- Status message -->
            <transition name="fade">
              <div
                v-if="scanStatus"
                class="scan-status"
                :class="scanStatusClass"
              >
                {{ scanStatus }}
              </div>
            </transition>

            <!-- Actions -->
            <div class="modal-actions">
              <div class="select-wrapper">
                <select
                  v-model="selectedCameraId"
                  class="camera-dropdown"
                  @change="onCameraChange"
                >
                  <option
                    v-for="camera in cameras"
                    :key="camera.id"
                    :value="camera.id"
                  >
                    {{ camera.label }}
                  </option>
                </select>
                <div class="select-arrow">▼</div>
              </div>

              <!-- Dynamic Start/Stop Buttons -->
              <button
                v-if="!isScanning"
                @click="startScanning"
                class="action-button start-button"
              >
                <span class="button-icon">▶️</span> Start Scanning
              </button>
              <button
                v-else
                @click="stopScanning"
                class="action-button stop-button"
              >
                <span class="button-icon">⏹️</span> Stop Scanning
              </button>

              <!-- Upload QR Code -->
              <button @click="scanImageFile" class="action-link">
                <span class="button-icon">📁</span> Upload QR Code
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick, onMounted, computed } from "vue";
import { Html5Qrcode } from "html5-qrcode";

// Console log filtering
onMounted(() => {
  setupConsoleSuppression();
});

// Function to suppress html5-qrcode console logs
const setupConsoleSuppression = () => {
  if (window.console) {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    // Only filter html5-qrcode logs
    console.log = function (...args) {
      if (args && args.length > 0) {
        const firstArg = String(args[0]);
        if (!firstArg.includes("html5-qrcode")) {
          originalLog.apply(console, args);
        }
      } else {
        originalLog.apply(console, args);
      }
    };

    console.error = function (...args) {
      if (args && args.length > 0) {
        const firstArg = String(args[0]);
        if (
          !firstArg.includes("html5-qrcode") &&
          !firstArg.includes("NotFoundException")
        ) {
          originalError.apply(console, args);
        }
      } else {
        originalError.apply(console, args);
      }
    };

    console.warn = function (...args) {
      if (args && args.length > 0) {
        const firstArg = String(args[0]);
        if (!firstArg.includes("html5-qrcode")) {
          originalWarn.apply(console, args);
        }
      } else {
        originalWarn.apply(console, args);
      }
    };
  }
};

// Function to restore original console methods
const restoreConsole = () => {
  if (window.console) {
    // Fixed __proto__ error by using proper type checking
    if (
      typeof console.log === "function" &&
      console.log.toString().includes("html5-qrcode")
    ) {
      // Restore original methods safely
      Object.defineProperty(window.console, "log", {
        value: window.console.__originalLog || console.log,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(window.console, "error", {
        value: window.console.__originalError || console.error,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(window.console, "warn", {
        value: window.console.__originalWarn || console.warn,
        writable: true,
        configurable: true,
      });
    }
  }
};

// Modal State
const showModal = ref(false);
const scanner = ref<Html5Qrcode | null>(null);
const cameras = ref<{ id: string; label: string }[]>([]);
const selectedCameraId = ref<string | null>(null);
const isScanning = ref(false);
const scanStatus = ref<string>("");
const scanSuccessful = ref<boolean>(false);

// Computed property for scan status class
const scanStatusClass = computed(() => {
  return {
    success: scanSuccessful.value,
    error: !scanSuccessful.value && scanStatus.value !== "",
  };
});

// Open Modal
const openModal = async () => {
  showModal.value = true;
  scanStatus.value = "";

  // Wait for DOM to render
  await nextTick();

  // Initialize scanner only after DOM is ready
  initScanner();
};

// Initialize Scanner
const initScanner = async () => {
  try {
    // Create new scanner instance if not exists
    if (!scanner.value) {
      // Create with verbose=false to disable internal logging
      scanner.value = new Html5Qrcode("reader", { verbose: false });
    }
    await fetchCameras();
    // Show initial message
    scanStatus.value = "ເລືອກກ້ອງ ແລະ ກົດ Start Scanning ເພື່ອເລີມສະແກນ";
  } catch (error) {
    console.error("Error initializing scanner:", error);
    scanStatus.value = "ບໍ່ສາມາດເລີ່ມຕົ້ນກ້ອງໄດ້ ກະລຸນາລອງອີກຄັ້ງ";
    scanSuccessful.value = false;
  }
};

// Close Modal
const closeModal = async () => {
  // Make sure to stop scanning before closing modal
  if (isScanning.value) {
    await stopScanning();
  }

  // Reset scanner to ensure clean state for next open
  if (scanner.value) {
    try {
      scanner.value.clear();
      scanner.value = null;
    } catch (error) {
      console.error("Error clearing scanner:", error);
    }
  }

  showModal.value = false;
  scanStatus.value = "";
};

// Fetch Available Cameras
const fetchCameras = async () => {
  try {
    const devices = await Html5Qrcode.getCameras();
    cameras.value = devices.map((device) => ({
      id: device.id,
      label: device.label || `Camera ${cameras.value.length + 1}`,
    }));

    if (cameras.value.length > 0) {
      selectedCameraId.value = cameras.value[0].id;
    } else {
      scanStatus.value = "ບໍ່ພົບກ້ອງ ກະລຸນາກວດສອບການອະນຸຍາດໃຊ້ງານກ້ອງ";
      scanSuccessful.value = false;
    }
  } catch (error) {
    console.error("Error fetching cameras:", error);
    scanStatus.value = "ບໍ່ສາມາດເຂົ້າເຖິງກ້ອງໄດ້ ກະລຸນາກວດສອບການອະນຸຍາດ";
    scanSuccessful.value = false;
  }
};

// Camera Change Handler
const onCameraChange = () => {
  if (isScanning.value) {
    stopScanning()
      .then(() => {
        startScanning();
      })
      .catch((error) => {
        console.error("Error changing camera:", error);
      });
  }
};

// Start Scanning
const startScanning = async () => {
  if (!selectedCameraId.value || !scanner.value) {
    scanStatus.value = "ບໍ່ພົບກ້ອງ ກະລຸນາກວດສອບການອະນຸຍາດໃຊ້ງານ";
    scanSuccessful.value = false;
    return;
  }

  try {
    scanStatus.value = "ກຳລັງເລີ່ມກ້ອງ...";

    // Comprehensive configuration for better QR code detection
    const config = {
      fps: 15, // Increased FPS for better detection
      qrbox: { width: 250, height: 250 }, // Adjusted for better focus
      aspectRatio: 1.0, // Square aspect ratio for QR codes
      disableFlip: false, // Allow both normal and mirrored QR codes
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true, // Use native API if available
      },
      formatsToSupport: [0], // Focus only on QR_CODE format for better performance
      // Advanced configuration
      videoConstraints: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        facingMode: "environment", // Use back camera by default
      },
    };

    await scanner.value.start(
      selectedCameraId.value,
      config,
      onScanSuccess,
      onScanError
    );

    isScanning.value = true;
    scanStatus.value = "ກຳລັງສະແກນ... ກະລຸນາ QR code ມາໃກ້ກ້ອງ";
  } catch (error) {
    console.error("Error starting scanner:", error);
    scanStatus.value = "ບໍ່ສາມາດເລີ່ມຕົ້ນກ້ອງໄດ້ ກະລຸນາລອງອີກຄັ້ງ";
    scanSuccessful.value = false;
    isScanning.value = false;
  }
};

// Stop Scanning - returns a Promise
const stopScanning = async (): Promise<void> => {
  if (scanner.value && isScanning.value) {
    try {
      await scanner.value.stop();
      isScanning.value = false;
      scanStatus.value = "ຢຸດສະແກນແລ້ວ";
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
  }
  return Promise.resolve();
};

// Scan an Image File
const scanImageFile = () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  scanStatus.value = "ກະລຸນາເລືອກຮູບພາບທີ່ມີ QR code";

  fileInput.onchange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];

      if (scanner.value) {
        try {
          scanStatus.value = "ກຳລັງອ່ານ QR code ຈາກຮູບພາບ...";

          // Try to scan in different modes for increased compatibility
          let result: string;
          try {
            // First try with the default mode
            result = await scanner.value.scanFile(file, true);
          } catch (firstError) {
            try {
              // If failed, try with compatibility mode
              result = await scanner.value.scanFile(file, false);
            } catch (secondError) {
              throw secondError; // If both fail, throw the error
            }
          }

          scanSuccessful.value = true;
          const processedResult = processQrCodeResult(result);
          scanStatus.value = `ສະແກນສຳເລັດ: ${processedResult}`;
          setTimeout(() => {
            alert(`ສະແກນສຳເລັດ: ${processedResult}`);
          }, 100);
        } catch (error) {
          console.error("Error scanning image file:", error);
          scanSuccessful.value = false;
          scanStatus.value = "ບໍ່ພົບ QR code ໃນຮູບພາບ ຫຼື ຮູບພາບບໍ່ຊັດເຈນ";
          setTimeout(() => {
            alert(
              "ບໍ່ພົບ QR code ໃນຮູບພາບ ກະລຸນາກວດສອບວ່າຮູບພາບຊັດເຈນແລະມີ QR code"
            );
          }, 100);
        }
      }
    }
  };

  fileInput.click();
};

// Process QR Code result to handle custom QR codes better
const processQrCodeResult = (result: string): string => {
  try {
    // Try if it's a valid JSON
    const jsonObject = JSON.parse(result);
    return JSON.stringify(jsonObject, null, 2);
  } catch (e) {
    // If not JSON, just return the raw text
    return result;
  }
};

// Handle Scan Success
const onScanSuccess = (decodedText: string) => {
  // Process the result to handle custom QR codes
  const processedResult = processQrCodeResult(decodedText);

  scanSuccessful.value = true;
  scanStatus.value = `ສະແກນສຳເລັດ: ${processedResult}`;
  setTimeout(() => {
    alert(`ສະແກນສຳເລັດ: ${processedResult}`);
  }, 100);

  // Optionally stop scanning after successful scan
  // stopScanning();
};

// Handle Scan Error - Simplified to reduce console spam
const onScanError = (error: unknown) => {
  // Don't log or display "NotFoundException" errors (normal during scanning)
  const errorStr = String(error);
  if (!errorStr.includes("NotFoundException")) {
    scanSuccessful.value = false;
    scanStatus.value = "ເກີດຂໍ້ຜິດພາດໃນການສະແກນ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ";
  }
};

// Handle keyboard events for closing modal with Escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && showModal.value) {
    closeModal();
  }
};

// Setup event listeners
onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  // Store original console methods for later restoration
  if (window.console) {
    window.console.__originalLog = window.console.log;
    window.console.__originalError = window.console.error;
    window.console.__originalWarn = window.console.warn;
  }
});

// Cleanup Scanner and restore console functions on Unmount
onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
  if (scanner.value) {
    if (isScanning.value) {
      scanner.value
        .stop()
        .then(() => {
          if (scanner.value) {
            return scanner.value.clear();
          }
          return Promise.resolve();
        })
        .catch(() => {
          // Silent catch to prevent unhandled promise rejection
        });
    } else if (scanner.value) {
      try {
        scanner.value.clear();
      } catch (error) {
        // Silent catch to prevent unhandled promise rejection
      }
    }
  }

  // Restore original console methods
  restoreConsole();
});
</script>

<style scoped>
/* Global styles & variables */
:root {
  --primary-color: #3182ce;
  --primary-darker: #2b6cb0;
  --success-color: #38a169;
  --success-darker: #2f855a;
  --danger-color: #e53e3e;
  --danger-darker: #c53030;
  --text-light: #ffffff;
  --text-dark: #2d3748;
  --gray-light: #edf2f7;
  --gray-medium: #e2e8f0;
  --gray-border: #cbd5e0;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
}

/* Base styles */
button {
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Button to Open Modal */
.open-modal-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--success-color);
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius-md);
  padding: 12px 20px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: var(--shadow-md);
  transition: transform 0.15s ease, background-color 0.3s ease,
    box-shadow 0.3s ease;
}

.open-modal-button:hover {
  background-color: var(--success-darker);
  box-shadow: var(--shadow-lg);
}

.open-modal-button:active {
  transform: translateY(1px);
}

.icon {
  font-size: 18px;
}

/* Modal transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

/* Modal Content */
.modal-content {
  background: white;
  padding: 24px;
  border-radius: var(--border-radius-lg);
  width: 90%;
  max-width: 500px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  z-index: 1001;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(0);
}

.modal-scanning {
  box-shadow: 0 0 0 2px var(--primary-color), var(--shadow-lg);
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-medium);
}

.modal-header h3 {
  font-size: 20px;
  margin: 0;
  font-weight: 600;
  color: var(--text-dark);
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
  color: #718096;
  border-radius: var(--border-radius-sm);
  transition: color 0.3s ease, background-color 0.3s ease;
}

.close-button:hover {
  color: #1a202c;
  background-color: var(--gray-light);
}

/* Scanner Container */
.scanner-container {
  width: 100%;
  height: 410px; /* Optimal height for scanner visibility */
  border: 1px solid var(--gray-border);
  border-radius: var(--border-radius-md);
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  background-color: #f8f9fa;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

/* Status message */
.scan-status {
  margin-bottom: 16px;
  padding: 10px 12px;
  border-radius: var(--border-radius-md);
  font-size: 15px;
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
}

.scan-status.success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #38a169;
}

.scan-status.error {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #e53e3e;
}

/* Custom dropdown */
.select-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.camera-dropdown {
  width: 100%;
  padding: 12px 14px;
  padding-right: 32px; /* Space for arrow */
  border-radius: var(--border-radius-md);
  border: 1px solid var(--gray-border);
  background-color: white;
  font-size: 15px;
  color: var(--text-dark);
  box-shadow: var(--shadow-sm);
  appearance: none; /* Remove default arrow */
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.camera-dropdown:hover,
.camera-dropdown:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color);
  outline: none;
}

.select-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
  pointer-events: none;
  font-size: 12px;
}

/* Actions */
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 16px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.button-icon {
  font-size: 18px;
}

.start-button {
  background-color: var(--primary-color);
  color: black;
}

.start-button:hover {
  background-color: var(--primary-darker);
  box-shadow: var(--shadow-md);
}

.stop-button {
  background-color: var(--danger-color);
  color: black;
}

.stop-button:hover {
  background-color: var(--danger-darker);
  box-shadow: var(--shadow-md);
}

.action-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: white;
  border: 1px solid var(--gray-border);
  color: var(--primary-color);
  border-radius: var(--border-radius-md);
  padding: 13px 16px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.action-link:hover {
  background-color: var(--gray-light);
  border-color: var(--primary-color);
  color: var(--primary-darker);
}

/* Mobile optimization */
@media (max-width: 576px) {
  .modal-content {
    width: 95%;
    padding: 18px;
  }

  .scanner-container {
    height: 280px;
  }

  .action-button,
  .action-link {
    padding: 12px;
  }

  .modal-header h3 {
    font-size: 18px;
  }
}

/* Landscape mode optimization */
@media (max-height: 600px) and (orientation: landscape) {
  .modal-content {
    max-height: 90vh;
    overflow-y: auto;
    padding: 16px;
  }

  .scanner-container {
    height: 220px;
  }
}

/* High-resolution displays */
@media (min-width: 1200px) {
  .modal-content {
    max-width: 550px;
  }

  .scanner-container {
    height: 380px;
  }
}
</style>

<style>
/* Global styles to ensure html5-qrcode UI elements integrate well */
#reader * {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
}

#reader video {
  border-radius: 4px;
  object-fit: cover;
}

/* Improve scan region visibility */
#reader__scan_region {
  background: transparent;
}

#reader__scan_region img {
  opacity: 0.8;
}

/* Style QR box */
#reader__scan_region::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(49, 130, 206, 0.7);
  border-radius: 8px;
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
  z-index: 2;
  pointer-events: none;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
  }
  70% {
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.4);
  }
  100% {
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
  }
}
</style>

<script lang="ts">
// Add global type definitions
declare global {
  interface Console {
    __originalLog?: typeof console.log;
    __originalError?: typeof console.error;
    __originalWarn?: typeof console.warn;
  }

  interface Window {
    console: Console;
  }
}
</script>
