<template>
  <div>
    <!-- Button to Open Modal -->
    <UiButton
      @click="openModal"
      type="primary"
      size="large"
      colorClass="!bg-primary-700 hover:!bg-primary-900 text-white flex items-center"
      icon="material-symbols:verified-rounded"
    >
      ກວດສອບ
    </UiButton>
    <div v-if="arrivalStore.isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>ກຳລັງກວດສອບ QR Code...</span>
    </div>

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
            <div
              v-show="showModal"
              id="reader"
              ref="scannerContainer"
              class="scanner-container"
            ></div>

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

            <!-- Debug info for better troubleshooting -->
            <div v-if="showDebugInfo" class="debug-info">
              <p>Debug Mode: {{ debugInfo }}</p>
            </div>

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

              <!-- QR Code Format Selection -->
              <div class="select-wrapper">
                <select
                  v-model="selectedFormat"
                  class="format-dropdown"
                  @change="updateScannerConfig"
                >
                  <option value="all">ທຸກຮູບແບບ QR</option>
                  <option value="standard">QR ມາດຕະຖານ</option>
                  <option value="custom">QR ແບບກຳນົດເອງ</option>
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

              <!-- Reset Scanner Button -->
              <button @click="resetScanner" class="reset-button">
                <span class="button-icon">🔄</span> ຣີເຊັດກ້ອງ
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
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useRouter } from "vue-router";
import { useArrivalStore } from "@/modules/registration/registration_arrival/store/arrival.store";
import UiButton from "../button/UiButton.vue";

// Debug Mode
const showDebugInfo = ref(false);
const debugInfo = ref("");
const router = useRouter();
const arrivalStore = useArrivalStore();

// Modal State
const showModal = ref(false);
const scanner = ref<Html5Qrcode | null>(null);
const cameras = ref<{ id: string; label: string }[]>([]);
const selectedCameraId = ref<string | null>(null);
const isScanning = ref(false);
const scanStatus = ref<string>("");
const scanSuccessful = ref<boolean>(false);
const selectedFormat = ref("all");
const scannerContainer = ref<HTMLElement | null>(null);
const instanceId = ref(`html5-qrcode-${Date.now()}`); // ใช้ ID ที่ไม่ซ้ำกันทุกครั้ง

// QR Code configuration
const scannerConfig = ref({
  fps: 15,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  disableFlip: false,
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true,
  },
  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], // Default to QR Code only
  videoConstraints: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    facingMode: "environment",
  },
});

// Computed property for scan status class
const scanStatusClass = computed(() => {
  return {
    success: scanSuccessful.value,
    error: !scanSuccessful.value && scanStatus.value !== "",
  };
});

// ฟังก์ชันรีเซ็ตสแกนเนอร์ใหม่ (เพิ่มใหม่)
const resetScanner = async () => {
  logDebugInfo("กำลังรีเซ็ตสแกนเนอร์...");

  // หยุดการสแกน
  if (isScanning.value) {
    await stopScanning();
  }

  // ล้างสแกนเนอร์เดิม
  if (scanner.value) {
    try {
      await scanner.value.clear();
      scanner.value = null;
    } catch (error) {
      logDebugInfo("ข้อผิดพลาดในการล้างสแกนเนอร์:", error);
    }
  }

  // รีเซ็ต DOM element
  if (scannerContainer.value) {
    scannerContainer.value.innerHTML = "";

    // สร้าง element div ใหม่
    const newScannerElement = document.createElement("div");
    newScannerElement.id = `reader-${Date.now()}`; // สร้าง ID ใหม่ทุกครั้ง
    scannerContainer.value.appendChild(newScannerElement);

    // สร้างสแกนเนอร์ใหม่
    try {
      scanner.value = new Html5Qrcode(newScannerElement.id, { verbose: false });
      await fetchCameras();
      scanStatus.value = "ຣີເຊັດກ້ອງສະແກນສຳເລັດ ກະລຸນາເລີ່ມສະແກນໃຫມ່";
    } catch (error) {
      logDebugInfo("ข้อผิดพลาดในการสร้างสแกนเนอร์ใหม่:", error);
      scanStatus.value = "รีเซ็ตล้มเหลว กรุณาลองปิดและเปิดหน้าต่างใหม่";
    }
  }
};

// Update scanner configuration based on selected format
const updateScannerConfig = () => {
  switch (selectedFormat.value) {
    case "all":
      // Support all QR code formats
      scannerConfig.value.formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.AZTEC,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
      ];
      break;
    case "custom":
      // Optimize for custom QR codes - may need adjustment based on your specific QR types
      scannerConfig.value.formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
      ];
      scannerConfig.value.qrbox = { width: 300, height: 300 }; // Larger scanning area
      scannerConfig.value.fps = 10; // Slower but more accurate
      break;
    case "standard":
      // For standard QR codes only
      scannerConfig.value.formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
      ];
      scannerConfig.value.qrbox = { width: 250, height: 250 };
      scannerConfig.value.fps = 15;
      break;
  }

  // Restart scanning if active
  if (isScanning.value && scanner.value) {
    stopScanning().then(() => {
      startScanning();
    });
  }
};

// Improved console log filtering
onMounted(() => {
  setupConsoleSuppression();
});

// Function to suppress html5-qrcode console logs
const setupConsoleSuppression = () => {
  if (window.console) {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    // Store original methods for restoration
    window.console.__originalLog = originalLog;
    window.console.__originalError = originalError;
    window.console.__originalWarn = originalWarn;

    // Only filter html5-qrcode logs
    console.log = function (...args) {
      if (args && args.length > 0) {
        const firstArg = String(args[0]);
        if (!firstArg.includes("html5-qrcode")) {
          originalLog.apply(console, args);
        } else if (showDebugInfo.value) {
          debugInfo.value = `Log: ${firstArg}`;
        }
      } else {
        originalLog.apply(console, args);
      }
    };

    console.error = function (...args) {
      if (args && args.length > 0) {
        const firstArg = String(args[0]);
        // Capture QR code errors for debugging but don't display in console
        if (
          firstArg.includes("html5-qrcode") ||
          firstArg.includes("NotFoundException")
        ) {
          // In debug mode, store the error message
          if (showDebugInfo.value) {
            debugInfo.value = `Error: ${firstArg}`;
          }
        } else {
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
        } else if (showDebugInfo.value) {
          debugInfo.value = `Warn: ${firstArg}`;
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
    if (window.console.__originalLog) {
      console.log = window.console.__originalLog;
    }
    if (window.console.__originalError) {
      console.error = window.console.__originalError;
    }
    if (window.console.__originalWarn) {
      console.warn = window.console.__originalWarn;
    }
  }
};

// Open Modal - แก้ไขเพื่อสร้าง scanner ใหม่ทุกครั้ง
const openModal = async () => {
  showModal.value = true;
  scanStatus.value = "";
  debugInfo.value = "";

  // Wait for DOM to render
  await nextTick();

  // Initialize scanner only after DOM is ready
  initScanner();
};

// Initialize Scanner - ปรับปรุงให้สร้าง scanner ใหม่ทุกครั้ง
const initScanner = async () => {
  try {
    // รีเซ็ต scanner container ก่อน
    if (document.getElementById("reader")) {
      document.getElementById("reader")!.innerHTML = "";
    }

    // สร้าง scanner ใหม่ทุกครั้ง
    scanner.value = new Html5Qrcode("reader", { verbose: false });

    await fetchCameras();
    // Show initial message
    scanStatus.value = "ເລືອກກ້ອງ ແລະ ກົດ Start Scanning ເພື່ອເລີມສະແກນ";
  } catch (error) {
    logDebugInfo("Error initializing scanner:", error);
    scanStatus.value = "ບໍ່ສາມາດເລີ່ມຕົ້ນກ້ອງໄດ້ ກະລຸນາລອງອີກຄັ້ງ";
    scanSuccessful.value = false;
  }
};

// Close Modal - ปรับปรุงให้ล้างทรัพยากรอย่างถูกต้อง
const closeModal = async () => {
  // Make sure to stop scanning before closing modal
  if (isScanning.value) {
    await stopScanning();
  }

  // Reset scanner to ensure clean state for next open
  if (scanner.value) {
    try {
      await scanner.value.clear();
      scanner.value = null;
    } catch (error) {
      logDebugInfo("Error clearing scanner:", error);
    }
  }

  // เพิ่ม: ล้าง DOM element เพื่อเริ่มต้นใหม่ในครั้งถัดไป
  if (document.getElementById("reader")) {
    document.getElementById("reader")!.innerHTML = "";
  }

  showModal.value = false;
  scanStatus.value = "";
  debugInfo.value = "";
};

// Fetch Available Cameras - เพิ่มการจัดการข้อผิดพลาด
const fetchCameras = async () => {
  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length) {
      cameras.value = devices.map((device) => ({
        id: device.id,
        label: device.label || `Camera ${cameras.value.length + 1}`,
      }));

      if (cameras.value.length > 0) {
        // Try to select back camera by default
        const backCamera = cameras.value.find(
          (camera) =>
            camera.label.toLowerCase().includes("back") ||
            camera.label.toLowerCase().includes("rear")
        );

        selectedCameraId.value = backCamera?.id || cameras.value[0].id;
      } else {
        scanStatus.value = "ບໍ່ພົບກ້ອງ ກະລຸນາກວດສອບການອະນຸຍາດໃຊ້ງານກ້ອງ";
        scanSuccessful.value = false;
      }
    } else {
      scanStatus.value = "ບໍ່ພົບກ້ອງ ກະລຸນາກວດສອບການອະນຸຍາດໃຊ້ງານກ້ອງ";
      scanSuccessful.value = false;
    }
  } catch (error) {
    logDebugInfo("Error fetching cameras:", error);
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
        logDebugInfo("Error changing camera:", error);
      });
  }
};

// Log to debug info
const logDebugInfo = (message: string, error?: any) => {
  if (showDebugInfo.value) {
    debugInfo.value = `${message} ${error ? JSON.stringify(error) : ""}`;
    console.log(message, error);
  }
};

// Start Scanning with improved error handling - ปรับปรุงให้มีการจัดการความผิดพลาดดีขึ้น
const startScanning = async () => {
  if (!selectedCameraId.value || !scanner.value) {
    scanStatus.value = "ບໍ່ພົບກ້ອງ ກະລຸນາກວດສອບການອະນຸຍາດໃຊ້ງານ";
    scanSuccessful.value = false;
    return;
  }

  try {
    scanStatus.value = "ກຳລັງເລີ່ມກ້ອງ...";

    // ตรวจสอบว่ากำลังสแกนอยู่แล้วหรือไม่
    if (isScanning.value) {
      await stopScanning();
    }

    // Apply the current scanner configuration
    await scanner.value.start(
      selectedCameraId.value,
      scannerConfig.value,
      onScanSuccess,
      onScanError
    );

    isScanning.value = true;
    scanStatus.value = "ກຳລັງສະແກນ... ກະລຸນາ QR code ມາໃກ້ກ້ອງ";
  } catch (error) {
    logDebugInfo("Error starting scanner:", error);

    // ถ้ามีข้อผิดพลาด ลองรีเซ็ตสแกนเนอร์อัตโนมัติ
    try {
      if (scanner.value) {
        await scanner.value.clear();
        scanner.value = null;
      }

      // สร้าง scanner ใหม่
      scanner.value = new Html5Qrcode("reader", { verbose: false });

      // ลองเริ่มการสแกนใหม่
      await scanner.value.start(
        selectedCameraId.value!,
        scannerConfig.value,
        onScanSuccess,
        onScanError
      );

      isScanning.value = true;
      scanStatus.value = "ກຳລັງສະແກນ... ກະລຸນາ QR code ມາໃກ້ກ້ອງ";
    } catch (secondError) {
      scanStatus.value = "ບໍ່ສາມາດເລີ່ມຕົ້ນກ້ອງໄດ້ ກະລຸນາກົດປຸ່ມ 'รีเซ็ตกล้อง'";
      scanSuccessful.value = false;
      isScanning.value = false;
    }
  }
};

// Stop Scanning - returns a Promise - ปรับปรุงให้จัดการข้อผิดพลาดดีขึ้น
const stopScanning = async (): Promise<void> => {
  if (scanner.value && isScanning.value) {
    try {
      await scanner.value.stop();
      isScanning.value = false;
      scanStatus.value = "ຢຸດສະແກນແລ້ວ";
    } catch (error) {
      logDebugInfo("Error stopping scanner:", error);
      // ถ้าไม่สามารถหยุดได้ ให้รีเซ็ตทั้งหมด
      try {
        if (scanner.value) {
          await scanner.value.clear();
        }
      } catch {}

      isScanning.value = false;
      scanner.value = null;
    }
  }
  return Promise.resolve();
};

// Improved scan image file with better error messaging
const scanImageFile = () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  scanStatus.value = "ກະລຸນາເລືອກຮູບພາບທີ່ມີ QR code";

  fileInput.onchange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];

      // ถ้าไม่มี scanner หรือการสแกนล้มเหลว สร้าง scanner ใหม่
      if (!scanner.value) {
        try {
          scanner.value = new Html5Qrcode("reader", { verbose: false });
        } catch (error) {
          logDebugInfo("Error creating scanner for file:", error);
          scanStatus.value = "ไม่สามารถสร้างสแกนเนอร์ได้ กรุณาลองใหม่";
          return;
        }
      }

      try {
        scanStatus.value = "ກຳລັງອ່ານ QR code ຈາກຮູບພາບ...";

        // Try different scanning modes with better error handling
        try {
          // First try with enhanced mode - this helps with custom QR codes
          const result = await scanner.value.scanFile(
            file,
            /* verbose= */ true
          );
          handleScanSuccess(result);
        } catch (firstError) {
          logDebugInfo(
            "First scan attempt failed, trying compatibility mode",
            firstError
          );
          try {
            // If failed, try with compatibility mode
            const result = await scanner.value.scanFile(
              file,
              /* verbose= */ false
            );
            handleScanSuccess(result);
          } catch (secondError) {
            // Try one more time with different parameters for custom QR codes
            logDebugInfo(
              "Second scan attempt failed, trying with different parameters",
              secondError
            );

            // Create a temporary image to get dimensions
            const img = new Image();
            img.onload = async () => {
              try {
                // For custom QRs, try again with advanced settings
                if (scanner.value) {
                  // Use scanFile with verbose mode enabled
                  const result = await scanner.value.scanFile(
                    file,
                    /* verbose= */ true
                  );
                  handleScanSuccess(result);
                }
              } catch (thirdError) {
                handleScanFailure();
              }
            };
            img.onerror = () => {
              handleScanFailure();
            };
            img.src = URL.createObjectURL(file);
          }
        }
      } catch (error) {
        handleScanFailure();
      }
    }
  };

  fileInput.click();
};

// Handle successful scan from file
const handleScanSuccess = async (result: string) => {
  try {
    scanStatus.value = `ກຳລັງກວດສອບ QR Code...`;

    // เรียกใช้ scanArrival จาก store
    const scanResult = await arrivalStore.scanArrival(result);

    if (scanResult?.id) {
      // ปิด Modal
      await closeModal();

      // นำทางไปยังหน้า details
      await router.push({
        name: "arrival_details",
        params: { id: scanResult.id.toString() },
      });
    }
  } catch (error) {
    console.error("Scan processing error:", error);
    scanStatus.value = "ເກີດຂໍ້ຜິດພາດໃນການປະມວນຜົນ QR Code";
  }
};
// Handle failed scan from file
const handleScanFailure = () => {
  scanSuccessful.value = false;
  scanStatus.value = "ບໍ່ພົບ QR code ໃນຮູບພາບ ຫຼື ຮູບພາບບໍ່ຊັດເຈນ";
  setTimeout(() => {
    alert("ບໍ່ພົບ QR code ໃນຮູບພາບ ກະລຸນາກວດສອບວ່າຮູບພາບຊັດເຈນແລະມີ QR code");
  }, 100);
};

const onScanSuccess = async (decodedText: string) => {
  try {
    scanStatus.value = `ກຳລັງກວດສອບ QR Code...`;

    // เรียกใช้ scanArrival จาก store
    const result = await arrivalStore.scanArrival(decodedText);

    if (result?.id) {
      // หยุดการสแกน
      await stopScanning();

      // ปิด Modal
      await closeModal();

      // นำทางไปยังหน้า details
      await router.push({
        name: "arrival_details",
        params: { id: result.id.toString() },
      });
    }
  } catch (error) {
    console.error("Scan processing error:", error);
    scanStatus.value = "ເກີດຂໍ້ຜິດພາດໃນການປະມວນຜົນ QR Code";
  }
};

// Enhanced error handling for scan error
const onScanError = (error: unknown) => {
  // Don't log or display "NotFoundException" errors (normal during scanning)
  const errorStr = String(error);
  if (!errorStr.includes("NotFoundException")) {
    scanSuccessful.value = false;
    scanStatus.value = "ເກີດຂໍ້ຜິດພາດໃນການສະແກນ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ";
    logDebugInfo("Scan error:", error);
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
});

// Cleanup Scanner and restore console functions on Unmount - ปรับปรุงการเคลียร์ทรัพยากร
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
        .catch((error) => {
          logDebugInfo("Error during cleanup:", error);
        })
        .finally(() => {
          // เพิ่ม: ล้าง DOM element
          if (document.getElementById("reader")) {
            document.getElementById("reader")!.innerHTML = "";
          }
          scanner.value = null;
        });
    } else if (scanner.value) {
      try {
        scanner.value.clear();
        if (document.getElementById("reader")) {
          document.getElementById("reader")!.innerHTML = "";
        }
        scanner.value = null;
      } catch (error) {
        logDebugInfo("Error during cleanup:", error);
        // เพิ่ม: ล้าง DOM element แม้จะมีข้อผิดพลาด
        if (document.getElementById("reader")) {
          document.getElementById("reader")!.innerHTML = "";
        }
        scanner.value = null;
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
}

/* High-resolution displays */
@media (min-width: 1200px) {
  .modal-content {
    max-width: 550px;
  }
}
/* Scanner Container - Professional Design */
.scanner-container {
  width: 100%;
  height: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(to bottom, #fcfcfc, #f0f2f5);
  border: 1px solid #e1e4e8;
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
    0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

/* Add scan frame animation and effects */
.scanner-container::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 280px;
  height: 280px;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(49, 130, 206, 0.8);
  border-radius: 12px;
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.25);
  z-index: 10;
  pointer-events: none;
  animation: scanner-pulse 2s infinite;
}

.scanner-container::after {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 280px;
  height: 2px;
  background: linear-gradient(
    to right,
    rgba(49, 130, 206, 0),
    rgba(49, 130, 206, 0.8),
    rgba(49, 130, 206, 0)
  );
  transform: translateX(-50%);
  animation: scanner-line 2s infinite ease-in-out;
  z-index: 11;
  box-shadow: 0 0 8px rgba(49, 130, 206, 0.6);
}

/* Corner markers for scan area */
.scanner-container .corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: rgba(49, 130, 206, 0.9);
  z-index: 12;
}

.scanner-container .corner-top-left {
  top: 50%;
  left: 50%;
  transform: translate(calc(-50% - 140px), calc(-50% - 140px));
  border-top: 3px solid;
  border-left: 3px solid;
  border-top-left-radius: 8px;
}

.scanner-container .corner-top-right {
  top: 50%;
  right: 50%;
  transform: translate(calc(50% + 140px), calc(-50% - 140px));
  border-top: 3px solid;
  border-right: 3px solid;
  border-top-right-radius: 8px;
}

.scanner-container .corner-bottom-left {
  bottom: 50%;
  left: 50%;
  transform: translate(calc(-50% - 140px), calc(50% + 140px));
  border-bottom: 3px solid;
  border-left: 3px solid;
  border-bottom-left-radius: 8px;
}

.scanner-container .corner-bottom-right {
  bottom: 50%;
  right: 50%;
  transform: translate(calc(50% + 140px), calc(50% + 140px));
  border-bottom: 3px solid;
  border-right: 3px solid;
  border-bottom-right-radius: 8px;
}

/* Status indicator */
.scanner-status {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 15;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Scanner animations */
@keyframes scanner-pulse {
  0% {
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.25);
    border-color: rgba(49, 130, 206, 0.8);
  }
  50% {
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3);
    border-color: rgba(66, 153, 225, 0.9);
  }
  100% {
    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.25);
    border-color: rgba(49, 130, 206, 0.8);
  }
}

@keyframes scanner-line {
  0% {
    top: calc(50% - 140px);
    opacity: 1;
  }
  50% {
    top: calc(50% + 140px);
    opacity: 0.8;
  }
  100% {
    top: calc(50% - 140px);
    opacity: 1;
  }
}

/* Improve the video element styling */
#reader video {
  object-fit: cover;
  border-radius: 8px;
}

/* Hide unnecessary html5-qrcode elements that don't look professional */
#reader__dashboard_section_csr button {
  background-color: #3182ce !important;
  color: white !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
  transition: background-color 0.3s ease !important;
}

#reader__dashboard_section_csr button:hover {
  background-color: #2b6cb0 !important;
}

#reader__dashboard_section_swaplink {
  display: none !important; /* Hide unnecessary swap link */
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .scanner-container {
    height: 350px;
  }

  .scanner-container::before {
    width: 220px;
    height: 220px;
  }

  .scanner-container .corner-top-left {
    transform: translate(calc(-50% - 110px), calc(-50% - 110px));
  }

  .scanner-container .corner-top-right {
    transform: translate(calc(50% + 110px), calc(-50% - 110px));
  }

  .scanner-container .corner-bottom-left {
    transform: translate(calc(-50% - 110px), calc(50% + 110px));
  }

  .scanner-container .corner-bottom-right {
    transform: translate(calc(50% + 110px), calc(50% + 110px));
  }

  @keyframes scanner-line {
    0% {
      top: calc(50% - 110px);
      opacity: 1;
    }
    50% {
      top: calc(50% + 110px);
      opacity: 0.8;
    }
    100% {
      top: calc(50% - 110px);
      opacity: 1;
    }
  }
}

/********************************************* */
.debug-info {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  margin-top: 10px;
  font-family: monospace;
  font-size: 12px;
  max-height: 100px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.format-dropdown {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  margin-right: 8px;
  cursor: pointer;
}
.reset-button {
  color: #0066cc;
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

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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
