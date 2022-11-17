import Image from 'next/image';
import appPreviewImg from '../assets/preview.png';
import logoImg from '../assets/logo.png';
import checkImg from '../assets/checked.png';
import { api } from '../lib/axios';
import { FormEvent, useState } from 'react';

interface HomeProps {
  betCount: number;
  guessCount: number;
  userCount: number;
}

export default function Home(props: HomeProps) {
  const [betTitle, setBetTitle] = useState('')

  async function createBet(event: FormEvent) {
    event.preventDefault()

    try {
      const response = await api.post('/bets', {
        title: betTitle,
    });

    const { code } = response.data;

    await navigator.clipboard.writeText(code)

    alert('Bolão criado com sucesso ! Código criado para a área de transferência')

    setBetTitle('')
  } catch (err) {
    alert('Falha ao criar o bolão, tente novamente !')
  }

}

  return (
    <div className="max-w-[1124px] h-screen mx-auto grid grid-cols-2 gap-28 items-center">
      <main>
        <Image src={logoImg} alt="Logo Qatar" quality={100} width={260} height={74}/>

      <h1 className="mt-14 text-white text-4xl font-bold leading-tight">
        Crie seu próprio bolão da copa e compartilhe entre amigos !
      </h1>

      <div className="mt-10 flex items-center gap-2">
        <strong className="text-gray-100 text-xl">
          <span className="text-green-500">+{props.userCount}</span> pessoas já estão usando
        </strong>
      </div>

      <form onSubmit={createBet} className="mt-10 flex gap-2">
        <input
          className="flex-1 px-6 py-4 rounded bg-gray-800 border border-gray-600 text-sm text-gray-100"
          type="text"
          required
          placeholder="Qual o nome do seu bolão ?"
          onChange={event => setBetTitle(event.target.value)}
          value={betTitle}
        />
        <button
          className="bg-yellow-500 px-6 py-4 rounded text-gray-900 font-bold text-sm uppercase hover:bg-yellow-700"
          type="submit"
        >
          Criar meu bolão
        </button>
      </form>

      <p className="mt-4 text-gray-300 leading-relaxed">
        Após criar seu bolão, você receberá um código único que poderá usar pra convidar outras pessoas
      </p>

      <div className="mt-10 pt-10 border-t border-gray-600 flex items-center justify-between text-gray-100">
        <div className="flex items-center gap-6">
          <Image src={checkImg} alt="" width={50} height={51}/>
          <div className="flex flex-col">
            <span className="font-bold text-2xl">+{props.betCount}</span>
            <span>Bolões criados</span>
          </div>
        </div>

        <div className="w-px h-14 bg-gray-600" />

        <div className="flex items-center gap-6">
          <Image src={checkImg} alt="" width={50} height={51}/>
          <div className="flex flex-col">
            <span className="font-bold text-2xl">+{props.guessCount}</span>
            <span>Palpites enviados</span>
          </div>
        </div>
      </div>   
      </main>

      <Image src={appPreviewImg} alt="Bolão Qatar" quality={100} width={600} />

    </div>
  )
}

export const getServerSideProps = async () => {
  const [betCountResponse, guessCountResponse, userCountResponse] = await Promise.all([
    api.get('bets/count'),
    api.get('guesses/count'),
    api.get('users/count')
  ])

  return {
    props: {
      betCount: betCountResponse.data.count,
      guessCount: guessCountResponse.data.count,
      userCount: userCountResponse.data.count,
    }
  }
}
