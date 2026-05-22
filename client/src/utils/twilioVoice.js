import { Device } from "@twilio/voice-sdk";

let device = null;
let activeCall = null;
let currentToken = "";
const listeners = new Set();

const emit = (payload) => {
  listeners.forEach((listener) => listener(payload));
};

const normalizeError = (error) => error?.message || "Could not start the browser call.";

const bindCallEvents = (call, meta) => {
  activeCall = call;
  emit({ status: "connecting", helperName: meta.helperName, helperId: meta.helperId });

  call.on("accept", () => {
    emit({ status: "in-progress", helperName: meta.helperName, helperId: meta.helperId });
  });

  call.on("disconnect", () => {
    activeCall = null;
    emit({ status: "ended", helperName: meta.helperName, helperId: meta.helperId });
  });

  call.on("cancel", () => {
    activeCall = null;
    emit({ status: "cancelled", helperName: meta.helperName, helperId: meta.helperId });
  });

  call.on("reject", () => {
    activeCall = null;
    emit({ status: "rejected", helperName: meta.helperName, helperId: meta.helperId });
  });

  call.on("error", (error) => {
    activeCall = null;
    emit({
      status: "error",
      helperName: meta.helperName,
      helperId: meta.helperId,
      message: normalizeError(error),
    });
  });
};

const ensureDevice = async (token) => {
  if (!device) {
    device = new Device(token, {
      codecPreferences: ["opus", "pcmu"],
      enableRingingState: true,
    });
    currentToken = token;

    device.on("error", (error) => {
      emit({ status: "error", message: normalizeError(error) });
    });
  } else if (currentToken !== token) {
    await device.updateToken(token);
    currentToken = token;
  }

  return device;
};

export const subscribeToCallState = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const startBrowserMaskedCall = async ({ token, helperId, helperName, startDate, monthlyBudget, message }) => {
  const voiceDevice = await ensureDevice(token);

  emit({ status: "requesting", helperName, helperId });

  const params = {
    helperId,
  };

  if (startDate) params.startDate = startDate;
  if (monthlyBudget !== undefined && monthlyBudget !== null && monthlyBudget !== "") {
    params.monthlyBudget = String(monthlyBudget);
  }
  if (message) params.message = message;

  const call = await voiceDevice.connect({ params });
  bindCallEvents(call, { helperId, helperName });
  return call;
};

export const hangupBrowserCall = () => {
  if (activeCall) {
    activeCall.disconnect();
  }
};
