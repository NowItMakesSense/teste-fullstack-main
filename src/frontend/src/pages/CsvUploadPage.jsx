import React, {useState} from 'react';

export default function CsvUploadPage() {
	const [log, setLog] = useState(null);

	function parseErro(e) {
		const linha = e.match(/Linha (\d+)/)?.[1];
		const raw = e.match(/raw='(.+)'/)?.[1];
		const msg = e
			.replace(/Linha \d+:\s*/, '')
			.replace(/\(raw='.*'\)/, '')
			.trim();

		return {linha, raw, msg};
	}

	async function handleUpload(e) {
		e.preventDefault();
		const file = e.target.file.files[0];
		const fd = new FormData();
		fd.append('file', file);
		const r = await fetch((import.meta.env.VITE_API_URL || 'https://localhost:50437') + '/api/import/csv', {
			method: 'POST',
			body: fd,
		});
		const j = await r.json();
		setLog(j);
	}

	return (
		<div>
			<h2>Importar CSV</h2>
			<div className='section'>
				<form onSubmit={handleUpload} style={{display: 'flex', gap: 10, alignItems: 'center'}}>
					<input type='file' name='file' accept='.csv' />
					<button type='submit'>Enviar</button>
				</form>
			</div>

			<h3 style={{marginTop: 16}}>Relatório</h3>
			<div className='section'>
				{!log && 'Aguardando upload...'}

				{log && (
					<div>
						<p>Processados: {log.processados}</p>
						<p>Inseridos: {log.inseridos}</p>
						<p>Erros: {log.erros?.length || 0}</p>

						{log.erros?.map((e, i) => {
							const err = parseErro(e);
							return (
								<div key={i} style={{marginTop: 8}}>
									<strong>Linha {err.linha}</strong> - {err.msg}
									<br />
									<code>{err.raw}</code>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
