import { ref } from 'vue';

export function useRemoveDarkClasses() {
	const observer = ref(null);

	const removeDarkClasses = () => {
		const els = document.querySelectorAll('[class*="dark:"]');

		els.forEach((el) => {
			el.classList.forEach((className) => {
				if (className.startsWith('dark:')) {
					el.classList.remove(className);
				}
			});
		});
	};

	const observeClasses = () => {
		observer.value = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((el) => {
					if (el.nodeType === Node.ELEMENT_NODE && el.matches('*')) {
						removeDarkClasses();
					}
				});
			});
		});

		observer.value.observe(document.body, {
			childList: true,
			subtree: true,
		});
	};

	const stopObserving = () => {
		console.log(observer.value);
		if (observer.value) {
			observer.value.disconnect();
			observer.value = null;
		}
	};

	return { observeClasses, stopObserving };
}
