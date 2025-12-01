// Minimal schema type used by the app. Kept intentionally small to satisfy build.
export type Schema = {
  Devices: {
    type: {
      device_id: string;
      status?: string;
      owner?: string;
      [key: string]: any;
    };
  };
};
