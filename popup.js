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
        copyButton.innerText = 'Copiar';
        copyButton.addEventListener('click', () => {
          copyToClipboard(attributes.src);
        });
        actionsCell.appendChild(copyButton);
        row.appendChild(actionsCell);

        const removeButton = document.createElement('button');
        removeButton.innerText = 'Eliminar';
        removeButton.addEventListener('click', () => {
          removeIframe(attributes.src);
        });
        actionsCell.appendChild(removeButton);

        row.appendChild(actionsCell);

        iframeListElement.appendChild(row);
      });
    });
  });

  document.getElementById('exportButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: exportIframesToCSV,
      }, (results) => {
        const csvData = results[0].result;
        downloadCSV(csvData);
      });
    });
  });
});

function analyzeIframes() {
  const iframes = Array.from(document.querySelectorAll('iframe')).map((iframe) => {
    const attributes = {
      src: iframe.src,
    };

    return attributes;
  });

  return iframes;
}

function exportIframesToCSV() {
  const iframes = Array.from(document.querySelectorAll('iframe')).map((iframe) => iframe.src);
  const csvData = 'data:text/csv;charset=utf-8,' + encodeURIComponent(iframes.join('\n'));
  return csvData;
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

function downloadCSV(csvData) {
  const link = document.createElement('a');
  link.setAttribute('href', csvData);
  link.setAttribute('download', 'iframes.csv');
  link.click();
}