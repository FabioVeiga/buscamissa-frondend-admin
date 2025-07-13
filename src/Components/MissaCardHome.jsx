
export default function MissaCardHome({ churchesCount, massesCount }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Encontre Missas Próximas
      </h2>
      <p className="text-gray-600 mb-4">
        Já são <strong>{churchesCount}</strong> igrejas e <strong>{massesCount}</strong> missas cadastradas em todo o Brasil.
      </p>
      <p className="text-gray-500 text-sm mb-4">
        Busque missas por dia e horário, ou ajude atualizando as informações da sua comunidade.
      </p>
      <a
        href="https://buscamissa.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Busca Missa
      </a>
    </div>
  );
}
