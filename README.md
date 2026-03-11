### Tela de Cliente
- Para essa tela decidi respeitar o Layout criado, e modifiquei para quando o Usuário clicar em algum item da lista, carregar as informações para dentro do Form modificando a sua aparência. Chamando por sua vez o método equivalente para a modificação do usuário selecionado.
  
   ![alt text](https://github.com/user-attachments/assets/dfe2e710-22e9-45d6-8fe2-72cf37c2b324)
  > Sem seleção.
  
  ![alt text](https://github.com/user-attachments/assets/004909bd-7714-4089-8409-1227b58fd4c1)
  > Usuário Selecionado.
  
- **Mensagens de Erro**: Em cada metodo no Front-End adicionei o metodo equivalente apenas para exibir a mensagem de forma simples
   ![alt text](https://github.com/user-attachments/assets/5bea2df9-ab91-46b0-ae70-8d914d646107)
   ![alt text](https://github.com/user-attachments/assets/0f4694b6-500b-4683-b409-f1c1f382df59)

### Tela de Veiculos
- Para a tela de veículos, decidi seguir a mesma lógica que fiz na anterior e seguir deixando alterar pelo clique, carregando as informações direto no formulário. Com a diferença que decidi aproveitar um pouco do código do <select> da mesma tela para permitir deixar o usuário realizar a troca de dono do veículo de forma mais controlada e facil.

   ![alt text](https://github.com/user-attachments/assets/262380d3-a099-40c0-885e-607dee4bcdcf)

### CSV
- Verificando no Back-End acabei notando que ele já me indicava a maioria das informações que poderia precisar, então apenas tratando e extraindo ja conseguiria mostrar isso de forma clara para o usuário.
  
      ```
      	function parseErro(e) {
      		const linha = e.match(/Linha (\d+)/)?.[1];
      		const raw = e.match(/raw='(.+)'/)?.[1];
      		const msg = e
      			.replace(/Linha \d+:\s*/, '')
      			.replace(/\(raw='.*'\)/, '')
      			.trim();
      
      		return {linha, raw, msg};
      	}
      ```
    ![alt text](https://github.com/user-attachments/assets/9436492e-780b-40d3-af94-27b5bd9e8a0c)

  ### Faturamento
-  Verificando o Bug do Faturamento vi que era por causa da falta de uma tabela de histórico de veículos, então acabei por criar a mesma, uma trigger e uma function para ter certeza que toda vez que modificarem a tabela de veículos, o histórico mostrar corretamente para quem o veículo foi trocado e quando o dono parou de ter posse do mesmo.

   ![alt text](https://github.com/user-attachments/assets/e704380e-6342-4bc5-916b-5ad781a7af76)


 ### Sugestoes de Melhorias
   - **Frontend** : 
      - Invés de usar o alert para alertar o usuário de erros, usaria alguma biblioteca do React para fazer isso, como o react-toastify ou react-notifications.
      - Utilização de bibliotecas responsivas e de fácil compreensão como Tailwind CSS, etc
      
   - **Backend** :
      - Utilização de Clean Architecture para separar corretamente as regras de negócio, infraestrutura, modelos da aplicação e toda parte da presentation.
      - Utilização de um Global Exception Middleware junto com um logger para registrar os erros e requisições da API. (Acabei colocando apenas para erros, achei melhor não gastar tanto tempo modificando tanto o projeto, caso contrário iria deixar muito diferente do que estava inicialmente).
      - Utilizaria provavelmente CQRS juntamente com o mediatR e Fluent Validation (esse já tem um pouco), assim conseguiria validar os requests (Command), e os Handlers ficaria livres e com pouco código e responsabilidade. Assim teria também um ótimo controle de tudo com o Logger.

      ```
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
      ```
   
