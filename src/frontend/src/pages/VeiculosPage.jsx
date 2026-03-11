import React, {useEffect, useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiGet, apiPost, apiPut, apiDelete} from '../api';

export default function VeiculosPage() {
	const valorPadraoForm = {id: 0, placa: '', modelo: '', ano: '', clienteId: ''};
	const qc = useQueryClient();
	const [clienteId, setClienteId] = useState('');
	const [newClienteId, setNewClienteId] = useState('');
	const clientes = useQuery({queryKey: ['clientes-mini'], queryFn: () => apiGet('/api/clientes?pagina=1&tamanho=100')});
	const veiculos = useQuery({
		queryKey: ['veiculos', clienteId],
		queryFn: () => apiGet(`/api/veiculos${clienteId ? `?clienteId=${clienteId}` : ''}`),
	});
	const [form, setForm] = useState(valorPadraoForm);
	const [editVisibility, setEditVisibility] = useState(false);

	const create = useMutation({
		mutationFn: (data) => apiPost('/api/veiculos', data),
		onSuccess: () => {
			qc.invalidateQueries({queryKey: ['veiculos']});
			setForm(valorPadraoForm);
			setEditVisibility(false);
		},
		onError: (error) => {
			alert(error.message);
		},
	});

	const update = useMutation({
		mutationFn: ({id, data}) => apiPut(`/api/veiculos/${id}`, data),
		onSuccess: () => {
			qc.invalidateQueries({queryKey: ['veiculos']});
			setForm(valorPadraoForm);
			setEditVisibility(false);
		},
		onError: (error) => {
			alert(error.message);
		},
	});

	const remover = useMutation({
		mutationFn: (id) => apiDelete(`/api/veiculos/${id}`),
		onSuccess: () => {
			qc.invalidateQueries({queryKey: ['veiculos']});
			setForm(valorPadraoForm);
			setEditVisibility(false);
		},
		onError: (error) => {
			alert(error.message);
		},
	});

	useEffect(() => {
		if (clientes.data?.itens?.length && !clienteId) {
			setClienteId(clientes.data.itens[0].id);
			setForm((f) => ({...f, clienteId: clientes.data.itens[0].id}));
		}
	}, [clientes.data]);

	return (
		<div>
			<h2>Veículos</h2>
			<div className='section'>
				<div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
					<label>Cliente: </label>
					<select
						value={clienteId}
						onChange={(e) => {
							setClienteId(e.target.value);
							setNewClienteId(e.target.value);
							setForm(valorPadraoForm);
							setEditVisibility(false);
						}}
					>
						{clientes.data?.itens?.map((c) => (
							<option key={c.id} value={c.id}>
								{c.nome}
							</option>
						))}
					</select>
				</div>
			</div>

			<h3>{!editVisibility ? 'Novo Veículo' : 'Editar Veículo'}</h3>
			<div className='section'>
				<div className='grid grid-4'>
					<input placeholder='Placa' value={form.placa} onChange={(e) => setForm({...form, placa: e.target.value})} />
					<input
						placeholder='Modelo'
						value={form.modelo}
						onChange={(e) => setForm({...form, modelo: e.target.value})}
					/>
					<input placeholder='Ano' value={form.ano} onChange={(e) => setForm({...form, ano: e.target.value})} />
					<button
						onClick={() => {
							!editVisibility
								? create.mutate({
										placa: form.placa,
										modelo: form.modelo,
										ano: form.ano ? Number(form.ano) : null,
										clienteId: form.clienteId || clienteId,
									})
								: update.mutate({
										id: form.id,
										data: {placa: form.placa, modelo: form.modelo, ano: form.ano, clienteId: newClienteId},
									});
						}}
					>
						Salvar
					</button>
				</div>
				<div className='grid grid-8'>
					<div style={{display: editVisibility ? 'flex' : 'none', gap: 10, alignItems: 'center', marginTop: '15px'}}>
						<label>Cliente: </label>
						<select
							value={newClienteId}
							onChange={(e) => {
								setNewClienteId(e.target.value);
							}}
						>
							{clientes.data?.itens?.map((c) => (
								<option key={c.id} value={c.id}>
									{c.nome}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			<h3 style={{marginTop: 16}}>Lista</h3>
			<div className='section'>
				{veiculos.isLoading ? (
					<p>Carregando...</p>
				) : (
					<table>
						<thead>
							<tr>
								<th>Placa</th>
								<th>Modelo</th>
								<th>Ano</th>
								<th>ClienteId</th>
								<th>Ações</th>
							</tr>
						</thead>
						<tbody>
							{veiculos.data?.map((v) => (
								<tr
									key={v.id}
									style={{cursor: 'pointer'}}
									onClick={() => {
										let newForm = {
											id: v.id,
											placa: String(v.placa),
											modelo: String(v.modelo),
											ano: String(v.ano),
											clienteId: String(v.clienteId),
										};

										setForm(newForm);
                    setNewClienteId(v.clienteId);
										setEditVisibility(true);
									}}
								>
									<td>{v.placa}</td>
									<td>{v.modelo}</td>
									<td>{v.ano ?? '-'}</td>
									<td>{v.clienteId}</td>
									<td style={{display: 'flex', gap: 8}}>
										<button className='btn-ghost' onClick={() => remover.mutate(v.id)}>
											Excluir
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
