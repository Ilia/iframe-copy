document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: analyzeIframes,
    }, (results) => {
      const iframeAttributes = results[0].result;
      const iframeListElement = document.getElementById('iframeList');
      iframeAttributes.forEach((attributes) => {
        if(!attributes.src){return;}
        const row = document.createElement('tr');

        const urlCell = document.createElement('td');
        urlCell.innerText = attributes.src.length > 50 ? attributes.src.substring(0,50) : attributes.src ;
        row.appendChild(urlCell);

        const actionsCell = document.createElement('td');
        const copyButton = document.createElement('button');
        copyButton.innerText = 'Copy';
        copyButton.addEventListener('click', () => {
          copyToClipboard(attributes.src);
        });
        actionsCell.appendChild(copyButton);
        row.appendChild(actionsCell);

        iframeListElement.appendChild(row);
      });
    });
  });
});

function analyzeIframes() {
  const iframes = Array.from(document.querySelectorAll('iframe')).map((iframe) => {
    const attributes = {
        src: null,
    };
    if (iframe.dataset.hasOwnProperty('src')) {
        attributes.src=iframe.dataset.src;
    }
    return attributes;
  });

  return iframes;
}



function removeIframe(src) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: removeIframeInTab,
      args: [src]
    });
  });
}

function removeIframeInTab(src) {
  const iframes = Array.from(document.querySelectorAll('iframe'));
  const iframeToRemove = iframes.find((iframe) => iframe.src === src);

  if (iframeToRemove) {
    iframeToRemove.remove();
    console.log('Iframe eliminado:', src);
  } else {
    console.warn('No se encontró el iframe:', src);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Texto copiado al portapapeles: ' + text);
  }).catch((error) => {
    console.error('Error al copiar el texto al portapapeles:', error);
  });
}

function removeAllIframeInTab() {
  const iframes = Array.from(document.querySelectorAll('iframe'));

  iframes.forEach((iframeToRemove)=>{
    if (iframeToRemove) {
      iframeToRemove.remove();
    }
  });
}