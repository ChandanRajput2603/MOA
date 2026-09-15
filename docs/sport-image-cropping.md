# Sports image cropping

Admin > Sports > Edit > Choose image to crop. Local PNG, JPEG and WebP files up to 10 MB open a 4:3 canvas preview. Zoom and horizontal/vertical sliders adjust framing. Crop & upload sends the cropped PNG to the existing upload API; Save changes then attaches its returned URL to the sport. Cancel crop leaves the previous saved image unchanged. Saving is disabled while a crop/upload is pending. Failures appear inline and allow retry.

The homepage sport visual uses the same 4:3 ratio at all viewport sizes and a 22px border radius. Its title overlays the lower image area. Other modules retain their existing upload control. Existing HTTPS image URLs remain supported; to crop an existing image, select its local original again.

Cloudinary credentials must be configured correctly. This does not fix Invalid Signature errors. Source review only: no runtime environment was available to run build or browser tests in this session.
