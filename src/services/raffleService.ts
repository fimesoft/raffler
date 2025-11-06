// We'll get session in components instead of here

const API_BASE_URL = 'http://localhost:5001/api';

export interface Raffle {
  id: string;
  title: string;
  description: string;
  prize: string;
  ticketPrice: number;
  maxTickets: number;
  soldTickets: number;
  endDate: string;
  image: string | null;
  createdAt: string;
  isActive?: boolean;
  winnerId?: string | null;
  user: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface CreateRaffleData {
  title: string;
  description: string;
  prize: string;
  ticketPrice: number;
  maxTickets: number;
  endDate: string;
  image?: string;
}

export interface RaffleResponse {
  raffles: Raffle[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface RaffleDetail extends Raffle {
  tickets?: {
    id: string;
    number: number;
    status: string;
    purchaseDate: string;
    buyer: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

const getAuthHeaders = (token?: string) => {
  return {
    'Content-Type': 'application/json',
    ...(token && {
      Authorization: `Bearer ${token}`
    })
  };
};

export const raffleService = {
  // Obtener todas las rifas (público)
  async getAllRaffles(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<RaffleResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}/raffles?${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener las rifas: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object' || !Array.isArray(data.raffles)) {
      throw new Error('Respuesta del servidor inválida');
    }
    
    return data;
  },

  // Obtener rifa por ID
  async getRaffleById(id: string): Promise<{ raffle: RaffleDetail }> {
    const response = await fetch(`${API_BASE_URL}/raffles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener la rifa');
    }

    return response.json();
  },

  // Crear nueva rifa (requiere autenticación)
  async createRaffle(data: CreateRaffleData, token: string): Promise<{ message: string; raffle: Raffle }> {
    const headers = getAuthHeaders(token);

    console.log(JSON.stringify(data));
    
    const response = await fetch(`${API_BASE_URL}/raffles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la rifa');
    }

    return response.json();
  },

  // Obtener rifas del usuario autenticado
  async getUserRaffles(token: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<RaffleResponse> {
    const headers = getAuthHeaders(token);
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/raffles/my?${queryParams}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Error al obtener tus rifas');
    }

    return response.json();
  },

  // Actualizar rifa (requiere autenticación y ser el creador)
  async updateRaffle(id: string, data: Partial<CreateRaffleData>, token: string): Promise<{ message: string; raffle: Raffle }> {
    const headers = getAuthHeaders(token);
    
    const response = await fetch(`${API_BASE_URL}/raffles/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar la rifa');
    }

    return response.json();
  },

  // Eliminar rifa (requiere autenticación y ser el creador)
  async deleteRaffle(id: string, token: string): Promise<{ message: string }> {
    const headers = getAuthHeaders(token);
    
    const response = await fetch(`${API_BASE_URL}/raffles/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar la rifa');
    }

    return response.json();
  },

  // Comprar boletos de una rifa (requiere autenticación)
  async purchaseTickets(
    raffleId: string,
    numbers: number[],
    token: string,
    paymentMethod?: 'mercadopago' | 'bank_transfer'
  ): Promise<{
    message: string;
    purchasedNumbers: number[];
    totalCost: number;
    transactionId: string;
    ticketsRemaining: number;
  }> {
    const headers = getAuthHeaders(token);

    const response = await fetch(`${API_BASE_URL}/raffles/${raffleId}/purchase`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        numbers,
        paymentMethod: paymentMethod || 'mercadopago'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.errors && Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.map((err: any) => err.msg).join(', '));
      }
      throw new Error(errorData.error || 'Error al comprar boletos');
    }

    return response.json();
  },

  // Obtener números vendidos de una rifa
  async getRaffleTickets(raffleId: string): Promise<{
    raffleId: string;
    soldNumbers: number[];
    totalSold: number;
    maxTickets: number;
    available: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/raffles/${raffleId}/tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener números vendidos');
    }

    return response.json();
  },

  // Obtener ventas de las rifas del usuario (requiere autenticación)
  async getRaffleSales(token: string, params?: {
    raffleId?: string;
    page?: number;
    limit?: number;
    buyerEmail?: string;
  }): Promise<{
    sales: Array<{
      id: string;
      buyerId: string;
      raffleId: string;
      buyer: {
        id: string;
        name: string;
        email: string;
        documentNumber: string | null;
        phone: string | null;
      };
      raffle: {
        id: string;
        title: string;
        ticketPrice: number;
        maxTickets: number;
      };
      numbers: number[];
      ticketCount: number;
      totalAmount: number;
      purchaseDate: string;
      status: string;
    }>;
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }> {
    const headers = getAuthHeaders(token);
    const queryParams = new URLSearchParams();
    
    if (params?.raffleId) queryParams.append('raffleId', params.raffleId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.buyerEmail) queryParams.append('buyerEmail', params.buyerEmail);

    const response = await fetch(`${API_BASE_URL}/raffles/my/sales?${queryParams}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Error al obtener las ventas');
    }

    return response.json();
  },

  // Sortear ganador de una rifa (requiere autenticación y ser el creador)
  async drawRaffleWinners(raffleId: string, token: string): Promise<{
    message: string;
    draw: {
      raffleId: string;
      raffleTitle: string;
      drawDate: string;
      winner: {
        ticketNumber: number;
        ticketId: string;
        buyer: {
          id: string;
          name: string;
          email: string;
          documentNumber: string | null;
          phone: string | null;
        };
      };
      totalParticipants: number;
      drawNumber: string;
    };
  }> {
    const headers = getAuthHeaders(token);

    const response = await fetch(`${API_BASE_URL}/raffles/${raffleId}/draw-winners`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al sortear ganadores');
    }

    return response.json();
  },

  // Obtener resultados del sorteo de una rifa (requiere autenticación y ser el creador)
  async getRaffleDrawResults(raffleId: string, token: string): Promise<{
    raffleId: string;
    raffleTitle?: string;
    hasWinner: boolean;
    message?: string;
    winner?: {
      ticketNumber: number;
      ticketId: string;
      buyer: {
        id: string;
        name: string;
        email: string;
        documentNumber: string | null;
        phone: string | null;
      };
    };
    totalParticipants?: number;
  }> {
    const headers = getAuthHeaders(token);

    const response = await fetch(`${API_BASE_URL}/raffles/${raffleId}/draw-results`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener resultados del sorteo');
    }

    return response.json();
  },

  // Confirmar pago de tickets (actualizar de RESERVED a SOLD)
  async confirmTicketPayment(raffleId: string, buyerId: string, token: string): Promise<{
    message: string;
    ticketsConfirmed: number;
  }> {
    const headers = getAuthHeaders(token);

    const response = await fetch(`${API_BASE_URL}/raffles/${raffleId}/confirm-payment/${buyerId}`, {
      method: 'PATCH',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al confirmar el pago');
    }

    return response.json();
  }
};