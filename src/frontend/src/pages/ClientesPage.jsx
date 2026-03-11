import React, {useState} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiGet, apiPost, apiPut, apiDelete} from '../api';

export default function ClientesPage() {
	const valorPadraoForm = {id: 0, nome: '', telefone: '', endereco: '', mensalista: false, valorMensalidade: ''};
	const qc = useQueryClient();
	const [filtro, setFiltro] = useState('');
	const [mensalista, setMensalista] = useState('all');
	const [editVisibility, setEditVisibility] = useState(false);
	const [form, setForm] = useState(valorPadraoForm);

	const q = useQuery({
		queryKey: ['clientes', filtro, mensalista],
		queryFn: () =>
			apiGet(`/api/clientes?pagina=1&tamanho=20&filtro=${encodeURIComponent(filtro)}&mensalista=${mensalista}`),
	});

	const create = useMutation({
		mutationFn: (data) => apiPost('/api/clientes', data),
		onSuccess: () => {
			qc.invalidateQueries({queryKey: ['clientes']});
			setForm(valorPadraoForm);
			setEditVisibility(false);
		},
		onError: (error) => {
			alert(error.message);
		},
	});

	const editar = useMutation({
		mutationFn: ({id, data}) => apiPut(`/api/clientes/${id}`, data),
		onSuccess: () => {
			qc.invalidateQueries({queryKey: ['clientes']});
			setForm(valorPadraoForm);
			setEditVisibility(false);
		},
		onError: (error) => {
			alert(error.message);
		},
	});

	const remover = useMutation({
		mutationFn: ({id}) => apiDelete(`/api/clientes/${id}`),
		onSuccess: () => {
			qc.invalidateQueries({queryKey: ['clientes']});
			setForm(valorPadraoForm);
			setEditVisibility(false);
		},
		onError: (error) => {
			alert(error.message);
		},
	});

	return (
		<div>
			<h2>Clientes</h2>
			<div className='section'>
				<div className='grid grid-3'>
					<input placeholder='Buscar por nome' value={filtro} onChange={(e) => setFiltro(e.target.value)} />
					<select value={mensalista} onChange={(e) => setMensalista(e.target.value)}>
						<option value='all'>Todos</option>
						<option value='true'>Mensalistas</option>
						<option value='false'>Não mensalistas</option>
					</select>
					<div />
				</div>
			</div>

			<h3>{!editVisibility ? 'Novo Cliente' : 'Editar Cliente'}</h3>
			<div className='section'>
				<div className='grid grid-4'>
					<input placeholder='Nome' value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} />
					<input
						placeholder='Telefone'
						value={form.telefone}
						onChange={(e) => setForm({...form, telefone: e.target.value})}
					/>
					<input
						placeholder='Endereço'
						value={form.endereco}
						onChange={(e) => setForm({...form, endereco: e.target.value})}
					/>
					<label style={{display: 'flex', alignItems: 'center', gap: 8}}>
						<input
							type='checkbox'
							checked={form.mensalista}
							onChange={(e) => setForm({...form, mensalista: e.target.checked})}
						/>{' '}
						Mensalista
					</label>
					<input
						placeholder='Valor mensalidade'
						value={form.valorMensalidade}
						onChange={(e) => setForm({...form, valorMensalidade: e.target.value})}
					/>
					<div />
					{!editVisibility ? (
						<div />
					) : (
						<button
							onClick={() => {
								setForm(valorPadraoForm);
								setEditVisibility(false);
							}}
						>
							Cancelar
						</button>
					)}
					<button
						onClick={() => {
							!editVisibility
								? create.mutate({
										nome: form.nome,
										telefone: form.telefone,
										endereco: form.endereco,
										mensalista: form.mensalista,
										valorMensalidade: form.valorMensalidade ? Number(form.valorMensalidade) : null,
									})
								: editar.mutate({
										id: form.id,
										data: {
											nome: form.nome,
											telefone: form.telefone,
											endereco: form.endereco,
											mensalista: form.mensalista,
											valorMensalidade: form.valorMensalidade ? Number(form.valorMensalidade) : null,
										},
									});
						}}
					>
						Salvar
					</button>
				</div>
			</div>

			<h3 style={{marginTop: 16}}>Lista</h3>
			<div className='section'>
				{q.isLoading ? (
					<p>Carregando...</p>
				) : (
					<table>
						<thead>
							<tr>
								<th>Nome</th>
								<th>Telefone</th>
								<th>Mensalista</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{q.data.itens.map((c) => (
								<tr
									key={c.id}
									style={{cursor: 'pointer'}}
									onClick={() => {
										let newForm = {
											id: c.id,
											nome: String(c.nome),
											telefone: String(c.telefone),
											endereco: String(c.endereco),
											mensalista: Boolean(c.mensalista),
											valorMensalidade: c.valorMensalidade ? Number(c.valorMensalidade) : null,
										};

										setForm(newForm);
										setEditVisibility(true);
									}}
								>
									<td>{c.nome}</td>
									<td>{c.telefone}</td>
									<td>{c.mensalista ? 'Sim' : 'Não'}</td>
									<td>
										<button
											className='btn-ghost'
											onClick={(event) => {
												event.stopPropagation();
												remover.mutate({id: c.id});
											}}
										>
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
