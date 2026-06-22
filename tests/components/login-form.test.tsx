import { render, screen, waitFor } from '@testing-library/react'
  import userEvent from '@testing-library/user-event'
  import { describe, it, expect, vi, beforeEach } from 'vitest'
  import { LoginForm } from '../../app/login/login-form'

  const mockPush = vi.fn()
  vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
  }))

  const mockLogin = vi.fn()
  vi.mock('@/app/context/auth/useAuth', () => ({
    useAuth: () => ({ login: mockLogin }),
  }))

  describe('LoginForm', () => {
    beforeEach(() => {
      mockPush.mockReset()
      mockLogin.mockReset()
    })

    it('renders email, password and submit button', () => {
      render(<LoginForm />)
  
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })
  
    it('calls login with credentials and redirects to /dashboard on success', async () => {
      mockLogin.mockResolvedValue(undefined)
      const user = userEvent.setup()
      render(<LoginForm />)
  
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  
    it('shows the error message when login throws', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'))
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
  
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })
  
    it('disables the button and shows "Signing in..." while submitting', async () => {
      let resolveLogin!: () => void
      mockLogin.mockImplementation(() => new Promise<void>(r => { resolveLogin = r }))

      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
  
      const clickPromise = user.click(screen.getByRole('button', { name: /sign in/i }))
  
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
      })

      resolveLogin()
      await clickPromise
    })
  }) 
