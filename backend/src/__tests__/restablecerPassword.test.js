const restablecerPasswordUseCase = require('../application/use-cases/usuarios/restablecerPassword');
const { comparePassword } = require('../infrastructure/security/passwordHelper');

describe('restablecerPassword', () => {
  const crearRepositorio = () => ({
    obtenerPorId: jest.fn().mockResolvedValue({ id: 'usuario-1' }),
    editar: jest.fn().mockResolvedValue(undefined),
  });

  it('guarda la nueva contraseña como hash', async () => {
    const usuarioRepository = crearRepositorio();
    const restablecerPassword = restablecerPasswordUseCase(usuarioRepository);

    await restablecerPassword('usuario-1', 'NuevaClave123');

    const [, cambios] = usuarioRepository.editar.mock.calls[0];
    expect(cambios.passwordHash).not.toBe('NuevaClave123');
    await expect(comparePassword('NuevaClave123', cambios.passwordHash)).resolves.toBe(true);
  });

  it('rechaza contraseñas con menos de 8 caracteres', async () => {
    const usuarioRepository = crearRepositorio();
    const restablecerPassword = restablecerPasswordUseCase(usuarioRepository);

    await expect(restablecerPassword('usuario-1', 'corta')).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(usuarioRepository.editar).not.toHaveBeenCalled();
  });
});