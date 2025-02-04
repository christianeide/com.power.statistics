const { createElement } = React;
const html = htm.bind(createElement);

export const LineIcon = () => html`
  <svg version="1.1" width="20" height="20" viewBox="0 0 40 40">
    <path
      d="M5.646,29C4.187,29,3,27.733,3,26.179c0-1.554,1.187-2.819,2.646-2.819c0.494,0,0.981,0.154,1.41,0.443l0.057,0.038
	l6.638-5.546l-0.007-0.059c-0.028-0.189-0.044-0.303-0.044-0.417c0-1.556,1.186-2.82,2.645-2.82c1.458,0,2.646,1.265,2.646,2.82
	c0,0.43-0.1,0.859-0.296,1.27l-0.028,0.061l2.671,3.587l0.063-0.023c0.264-0.087,0.53-0.132,0.795-0.132
	c0.521,0,1.027,0.163,1.463,0.475l0.063,0.042l8.216-8.145l-0.025-0.066c-0.133-0.345-0.2-0.703-0.2-1.068
	c0-1.554,1.187-2.818,2.646-2.818S37,12.265,37,13.818c0,1.555-1.187,2.82-2.646,2.82c-0.407,0-0.811-0.108-1.198-0.322
	l-0.059-0.031l-8.381,8.311l0.016,0.06c0.072,0.279,0.106,0.515,0.106,0.744c0,1.553-1.187,2.821-2.646,2.821
	s-2.646-1.269-2.646-2.821c0-0.514,0.138-1.011,0.411-1.478l0.035-0.061L17.415,20.4l-0.066,0.026
	c-0.318,0.141-0.656,0.211-1.004,0.211c-0.603,0-1.191-0.221-1.659-0.623l-0.059-0.052l-0.105,0.002l-6.378,5.327l0.019,0.068
	c0.087,0.302,0.128,0.563,0.128,0.818C8.291,27.733,7.104,29,5.646,29L5.646,29z M5.646,25.181c-0.517,0-0.938,0.448-0.938,0.998
	c0,0.553,0.421,1,0.938,1s0.938-0.447,0.938-1C6.583,25.629,6.163,25.181,5.646,25.181L5.646,25.181z M22.193,24.401
	c-0.212,0-0.408,0.07-0.57,0.205c-0.234,0.19-0.368,0.479-0.368,0.793c0,0.551,0.421,0.999,0.938,0.999
	c0.517,0,0.938-0.448,0.938-0.999S22.71,24.401,22.193,24.401L22.193,24.401z M16.344,16.82c-0.517,0-0.938,0.448-0.938,0.999
	c0,0.302,0.128,0.586,0.351,0.778c0.134,0.114,0.37,0.188,0.603,0.188c0.184,0,0.445-0.045,0.646-0.26
	c0.177-0.188,0.275-0.439,0.275-0.706C17.281,17.269,16.86,16.82,16.344,16.82L16.344,16.82z M34.354,12.821
	c-0.517,0-0.938,0.445-0.938,0.997c0,0.551,0.421,0.999,0.938,0.999s0.938-0.448,0.938-0.999
	C35.293,13.267,34.871,12.821,34.354,12.821L34.354,12.821z"
      fill="var(--homey-text-color)"
    />
  </svg>
`;

export const BarIcon = () => html`
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="12"
      y="10"
      width="3"
      height="7"
      rx="0.5"
      fill="var(--homey-text-color)"
    />
    <rect
      x="16"
      y="4"
      width="3"
      height="13"
      rx="0.5"
      fill="var(--homey-text-color)"
    />
    <rect
      x="20"
      y="7"
      width="3"
      height="10"
      rx="0.5"
      fill="var(--homey-text-color)"
    />
  </svg>
`;
