import { Response, Request, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import { IUser } from '../../types'
import { User } from '../../models/user'
import { Quiz } from '../../models/quiz'
import { Todo } from '../../models/todo'
import { Joke } from '../../models/joke'
import { ITokenPayload, IToken } from '../../types'
import jwt, { JwtPayload, Secret } from 'jsonwebtoken'
import { sendMail } from '../email'
import { ELanguage } from '../../types'

const dotenv = require('dotenv')
dotenv.config()

enum EError {
  en = 'An error occurred',
  es = 'Ha ocurrido un error',
  fr = 'Une erreur est survenue',
  de = 'Ein Fehler ist aufgetreten',
  pt = 'Ocorreu um erro',
  cs = 'Došlo k chybě',
  fi = 'Virhe tapahtui',
}
// enum ELanguage {
//   en = 'en',
//   es = 'es',
//   fr = 'fr',
//   de = 'de',
//   pt = 'pt',
//   cs = 'cs',
//   fi = 'fi',
// }

enum EJenniinaFi {
  en = 'Jenniina.fi React',
  es = 'React Jenniina.fi',
  fr = 'React Jenniina.fi',
  de = 'Jenniina.fi React',
  pt = 'React Jenniina.fi',
  cs = 'Jenniina.fi React',
  fi = 'Jenniina.fi React',
}
enum EBackToTheApp {
  en = 'Back to the App',
  es = 'Volver a la aplicación',
  fr = 'Retour à l application',
  de = 'Zurück zur App',
  pt = 'Voltar para o aplicativo',
  cs = 'Zpět do aplikace',
  fi = 'Takaisin sovellukseen',
}
enum EErrorCreatingToken {
  en = 'Error creating token',
  es = 'Error al crear el token',
  fr = 'Erreur lors de la création du jeton',
  de = 'Fehler beim Erstellen des Tokens',
  pt = 'Erro ao criar token',
  cs = 'Chyba při vytváření tokenu',
  fi = 'Virhe luotaessa tokenia',
}
enum EHelloWelcome {
  en = 'Hello, welcome to the Jenniina.fi site.',
  es = 'Hola, bienvenido al sitio Jenniina.fi.',
  fr = 'Bonjour, bienvenue sur le site Jenniina.fi.',
  de = 'Hallo, willkommen auf der Website Jenniina.fi.',
  pt = 'Olá, bem-vindo ao site Jenniina.fi.',
  cs = 'Ahoj, vítejte na webu Jenniina.fi.',
  fi = 'Hei, tervetuloa Jenniina.fi-sivustolle.',
}
enum EEmailMessage {
  en = 'Please verify your email',
  es = 'Por favor verifica tu correo electrónico',
  fr = 'Veuillez vérifier votre email',
  de = 'Bitte überprüfen Sie Ihre E-Mail',
  pt = 'Por favor, verifique seu email',
  cs = 'Prosím, ověřte svůj email',
  fi = 'Vahvista sähköpostisi',
}
enum EErrorSendingMail {
  en = 'Error sending mail',
  es = 'Error al enviar el correo',
  fr = 'Erreur lors de l envoi du mail',
  de = 'Fehler beim Senden der E-Mail',
  pt = 'Erro ao enviar email',
  cs = 'Chyba při odesílání emailu',
  fi = 'Virhe sähköpostin lähetyksessä',
}
enum ETokenSent {
  en = 'Token sent',
  es = 'Token enviado',
  fr = 'Jeton envoyé',
  de = 'Token gesendet',
  pt = 'Token enviado',
  cs = 'Token odeslán',
  fi = 'Token lähetetty',
}
enum ENoTokenProvided {
  en = 'No token provided',
  es = 'No se proporcionó ningún token',
  fr = 'Aucun jeton fourni',
  de = 'Kein Token angegeben',
  pt = 'Nenhum token fornecido',
  cs = 'Nebyl poskytnut žádný token',
  fi = 'Ei toimitettu tokenia',
}

enum ETokenVerified {
  en = 'Token verified',
  es = 'Token verificado',
  fr = 'Jeton vérifié',
  de = 'Token verifiziert',
  pt = 'Token verificado',
  cs = 'Token ověřen',
  fi = 'Token tarkistettu',
}

enum EPasswordReset {
  en = 'Password reset',
  es = 'Restablecimiento de contraseña',
  fr = 'Réinitialisation du mot de passe',
  de = 'Passwort zurücksetzen',
  pt = 'Redefinição de senha',
  cs = 'Obnovení hesla',
  fi = 'Salasanan palautus',
}
enum EResetPassword {
  en = 'Reset password',
  es = 'Restablecer la contraseña',
  fr = 'Réinitialiser le mot de passe',
  de = 'Passwort zurücksetzen',
  pt = 'Redefinir senha',
  cs = 'Obnovit heslo',
  fi = 'Nollaa salasana',
}
enum ENewPassword {
  en = 'New Password',
  es = 'Nueva contraseña',
  fr = 'Nouveau mot de passe',
  de = 'Neues Kennwort',
  pt = 'Nova senha',
  cs = 'Nové heslo',
  fi = 'Uusi salasana',
}
enum EConfirmPassword {
  en = 'Confirm Password',
  es = 'Confirmar contraseña',
  fr = 'Confirmez le mot de passe',
  de = 'Kennwort bestätigen',
  pt = 'Confirme a Senha',
  cs = 'Potvrďte heslo',
  fi = 'Vahvista salasana',
}
enum EInvalidLoginCredentials {
  en = 'Invalid login credentials',
  es = 'Credenciales de inicio de sesión no válidas',
  fr = 'Informations de connexion invalides',
  de = 'Ungültige Anmeldeinformationen',
  pt = 'Credenciais de login inválidas',
  cs = 'Neplatné přihlašovací údaje',
  fi = 'Virheelliset kirjautumistiedot',
}
enum EInvalidOrMissingToken {
  en = 'Invalid or missing request',
  es = 'Solicitud inválida o faltante',
  fr = 'Demande invalide ou manquante',
  de = 'Ungültige oder fehlende Anfrage',
  pt = 'Solicitação inválida ou ausente',
  cs = 'Neplatný nebo chybějící požadavek',
  fi = 'Virheellinen tai puuttuva pyyntö',
}
enum EPleaseCheckYourEmailIfYouHaveAlreadyRegistered {
  en = 'Please check your email if you have already registered',
  es = 'Por favor, compruebe su correo electrónico si ya se ha registrado',
  fr = 'Veuillez vérifier votre email si vous êtes déjà inscrit',
  de = 'Bitte überprüfen Sie Ihre E-Mail, wenn Sie sich bereits registriert haben',
  pt = 'Por favor, verifique seu email se você já se registrou',
  cs = 'Zkontrolujte svůj email, pokud jste se již zaregistrovali',
  fi = 'Tarkista sähköpostisi, jos olet jo rekisteröitynyt',
}
enum ELogInAtTheAppOrRequestANewPasswordResetToken {
  en = 'Log in at the app or request a new password reset token',
  es = 'Inicie sesión en la aplicación o solicite un nuevo token de restablecimiento de contraseña',
  fr = 'Connectez-vous à l application ou demandez un nouveau jeton de réinitialisation de mot de passe',
  de = 'Melden Sie sich in der App an oder fordern Sie einen neuen Token zum Zurücksetzen des Passworts an',
  pt = 'Faça login no aplicativo ou solicite um novo token de redefinição de senha',
  cs = 'Přihlaste se do aplikace nebo požádejte o nový token pro obnovení hesla',
  fi = 'Kirjaudu sovellukseen tai pyydä uusi salasanan palautustoken',
}
enum EAccessDeniedAdminPrivilegeRequired {
  en = 'Access denied. Admin privilege required.',
  es = 'Acceso denegado. Se requiere privilegio de administrador.',
  fr = 'Accès refusé. Privilège administrateur requis.',
  de = 'Zugriff verweigert. Admin-Berechtigung erforderlich.',
  pt = 'Acesso negado. Privilégio de administrador necessário.',
  cs = 'Přístup odepřen. Vyžaduje se oprávnění správce.',
  fi = 'Pääsy evätty. Vaaditaan ylläpitäjän oikeudet.',
}
enum EAuthenticationFailed {
  en = 'Authentication failed',
  es = 'Autenticación fallida',
  fr = 'L authentification a échoué',
  de = 'Authentifizierung fehlgeschlagen',
  pt = 'Autenticação falhou',
  cs = 'Autentizace selhala',
  fi = 'Todennus epäonnistui',
}
enum EUserAdded {
  en = 'User added',
  es = 'Usuario añadido',
  fr = 'Utilisateur ajouté',
  de = 'Benutzer hinzugefügt',
  pt = 'Usuário adicionado',
  cs = 'Uživatel přidán',
  fi = 'Käyttäjä lisätty',
}
enum EUserUpdated {
  en = 'User updated',
  es = 'Usuario actualizado',
  fr = 'Utilisateur mis à jour',
  de = 'Benutzer aktualisiert',
  pt = 'Usuário atualizado',
  cs = 'Uživatel aktualizován',
  fi = 'Käyttäjä päivitetty',
}
enum EUserDeleted {
  en = 'User deleted',
  es = 'Usuario borrado',
  fr = 'Utilisateur supprimé',
  de = 'Benutzer gelöscht',
  pt = 'Usuário excluído',
  cs = 'Uživatel smazán',
  fi = 'Käyttäjä poistettu',
}
enum EYouHaveLoggedOut {
  en = 'You have logged out',
  es = 'Has cerrado la sesión',
  fr = 'Vous vous êtes déconnecté',
  de = 'Sie haben sich abgemeldet',
  pt = 'Você saiu',
  cs = 'Odhlásili jste se',
  fi = 'Olet kirjautunut ulos',
}

enum EUsernameRequired {
  en = 'Username required',
  es = 'Nombre de usuario requerido',
  fr = 'Nom d utilisateur requis',
  de = 'Benutzername erforderlich',
  pt = 'Nome de usuário obrigatório',
  cs = 'Vyžadováno uživatelské jméno',
  fi = 'Käyttäjätunnus vaaditaan',
}
enum ESuccessfullyLoggedIn {
  en = 'Successfully logged in',
  es = 'Iniciado sesión con éxito',
  fr = 'Connecté avec succès',
  de = 'Erfolgreich angemeldet',
  pt = 'Logado com sucesso',
  cs = 'Úspěšně přihlášen',
  fi = 'Kirjauduttu onnistuneesti',
}

const generateToken = async (id: string | undefined): Promise<string | undefined> => {
  if (!id) return undefined

  const secret: Secret = process.env.JWT_SECRET || 'sfj0ker8GJ3RT3s5djdf23'
  const options = { expiresIn: '1d' }
  try {
    const token = (await new Promise<string | undefined>((resolve, reject) => {
      jwt.sign({ userId: id }, secret, options, (err, token) => {
        if (err) {
          console.error(err)
          reject(undefined)
        } else {
          console.log('tokennnn', token)
          resolve(token)
        }
      })
    })) as IToken['token']
    return token
  } catch (error) {
    console.error('Error generating token:', error)
    return undefined
  }
}

const verifyToken = (token: string) => {
  const secret: Secret = process.env.JWT_SECRET || 'sfj0ker8GJ3RT3s5djdf23'
  console.log('TOKEN VERIFY', jwt.verify(token, secret))
  return jwt.verify(token, secret) as ITokenPayload
}

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token)
      throw new Error(ENoTokenProvided[(req.body.language as ELanguage) || 'en'])
    console.log('TOKEN', token)
    const decoded = verifyToken(token)
    console.log('Decoded:', decoded)
    if (!decoded) throw new Error('Token not decoded')
    const user: IUser | null = await User.findById(decoded?.userId)
    const language = user?.language || 'en'

    if (!user) throw new Error(EAuthenticationFailed[language as ELanguage])

    // Attach user information to the request object
    req.body.user = user
    next()
  } catch (error) {
    //throw new Error((error as Error).message)
    console.error('Error:', error)
    res.status(401).json({ success: false, message: 'Authentication failed' })
  }
}
// const secret: Secret = process.env.JWT_SECRET || 'sfj0ker8GJ3RT3s5djdf23'
// try {
//   if (token) return jwt.verify(token, secret) as JwtPayload
//   else return undefined
// } catch (error) {
//   if ((error as Error).name === 'TokenExpiredError') {
//     throw new Error('Token expired')
//   } else {
//     throw error // Re-throw other errors
//   }
// }

const verifyTokenMiddleware = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1] as IToken['token']
    if (!token)
      throw new Error(ENoTokenProvided[(req.body.language as ELanguage) || 'en'])
    const decoded = verifyToken(token)
    const user: IUser | null = await User.findById(decoded?.userId)
    if (!user) throw new Error('User not found')
    res.status(200).json({
      message:
        ETokenVerified[(req.body.language as ELanguage) || 'en'] || 'Token verified',
    })
  } catch (error) {
    console.error('Error:', error)
    res
      .status(500)
      .json({ success: false, message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

// Middleware to check if the user has admin role
const checkIfAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.body
  const language = user.language
  if (user && user.role > 2) {
    // User is an admin, allow access
    next()
  } else {
    // User is not an admin, deny access
    res.status(403).json({
      message:
        EAccessDeniedAdminPrivilegeRequired[language as ELanguage] ||
        'Access denied. Admin privilege required.',
    })
  }
}

const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users: IUser[] = await User.find()
    res.status(200).json(users)
  } catch (error) {
    console.error('Error:', error)
    res
      .status(500)
      .json({ success: false, message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user: IUser | null = await User.findById(req.params.id)
    res.status(200).json(user)
  } catch (error) {
    console.error('Error:', error)
    res
      .status(500)
      .json({ success: false, message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const addUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IUser, 'name' | 'username' | 'password' | 'language'>

    const user: IUser = new User({
      name: body.name,
      username: body.username,
      password: body.password,
      language: body.language,
      verified: false,
    })

    const newUser: IUser = await user.save()
    const allUsers: IUser[] = await User.find()

    res.status(201).json({
      success: true,
      message: EUserAdded[newUser.language || 'en'],
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        password: newUser.password,
        language: newUser.language,
        verified: newUser.verified,
      },
      users: allUsers,
    })
  } catch (error) {
    console.error('Error:', error)
    res
      .status(500)
      .json({ success: false, message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const updateUsername = async (req: Request, res: Response): Promise<void> => {
  enum EEmailConfirmation {
    en = 'Email Confirmation, Jenniina.fi',
    es = 'Confirmación de correo electrónico, Jenniina.fi',
    fr = 'Confirmation de l email, Jenniina.fi',
    de = 'E-Mail-Bestätigung, Jenniina.fi',
    pt = 'Confirmação de email, Jenniina.fi',
    cs = 'Potvrzení e-mailu, Jenniina.fi',
    fi = 'Sähköpostin vahvistus, Jenniina.fi',
  }
  enum EConfirmEmail {
    en = 'Please confirm your email address by clicking the link',
    es = 'Por favor confirme su dirección de correo electrónico haciendo clic en el enlace',
    fr = 'Veuillez confirmer votre adresse email en cliquant sur le lien',
    de = 'Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den Link klicken',
    pt = 'Por favor, confirme seu endereço de email clicando no link',
    cs = 'Potvrďte svou e-mailovou adresu kliknutím na odkaz',
    fi = 'Vahvista sähköpostiosoitteesi napsauttamalla linkkiä',
  }
  enum EUpdatePending {
    en = 'Username update pending, please check your email for a confirmation link.',
    es = 'Actualización de nombre de usuario pendiente, por favor revise su correo electrónico para obtener un enlace de confirmación.',
    fr = 'Mise à jour du nom d utilisateur en attente, veuillez vérifier votre email pour un lien de confirmation.',
    de = 'Benutzername Update ausstehend, bitte überprüfen Sie Ihre E-Mail für einen Bestätigungslink.',
    pt = 'Atualização do nome de usuário pendente, verifique seu email para um link de confirmação.',
    cs = 'Aktualizace uživatelského jména čeká, zkontrolujte svůj e-mail na potvrzovací odkaz.',
    fi = 'Käyttäjätunnuksen päivitys odottaa, tarkista sähköpostisi vahvistuslinkkiä varten.',
  }
  try {
    const { body } = req
    const { _id, username } = body
    const user = await User.findById(_id)
    if (user) {
      const token = await generateToken(user._id)
      user.set('confirmToken', token)
      user.markModified('verified')
      await user.save()

      // Prepare email details
      const subject = EEmailConfirmation[(user.language as unknown as ELanguage) || 'en']
      const message = EConfirmEmail[(user.language as unknown as ELanguage) || 'en']
      const link = `${process.env.BASE_URI}/api/users/${username}/confirm-email/${token}?lang=${user.language}`
      const language = (user.language as unknown as ELanguage) || 'en'
      // Send confirmation email to new address
      await sendMail(subject, message, username, language, link)

      res.status(200).json({
        success: true,
        message: EUpdatePending[user.language || 'en'],
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the username',
    })
  }
}

const confirmEmail = async (req: Request, res: Response): Promise<void> => {
  enum EEmailConfirmed {
    en = 'Email Confirmed',
    es = 'Correo electrónico confirmado',
    fr = 'Email confirmé',
    de = 'E-Mail bestätigt',
    pt = 'Email confirmado',
    cs = 'E-mail potvrzeno',
    fi = 'Sähköposti vahvistettu',
  }
  enum EEmailHasBeenConfirmed {
    en = 'Your email has been confirmed.',
    es = 'Tu correo electrónico ha sido confirmado.',
    fr = 'Votre email a été confirmé.',
    de = 'Ihre E-Mail wurde bestätigt.',
    pt = 'Seu email foi confirmado.',
    cs = 'Váš e-mail byl potvrzen.',
    fi = 'Sähköposti on vahvistettu.',
  }
  enum ELogInAtTheAppOrRequestANewEmailConfirmToken {
    en = 'If your email (username) has not been changed, please check the app to request a new email confirmation token.',
    es = 'Si su correo electrónico (nombre de usuario) no ha cambiado, verifique la aplicación para solicitar un nuevo token de confirmación de correo electrónico.',
    fr = 'Si votre email (nom d utilisateur) n a pas été modifié, veuillez vérifier l application pour demander un nouveau jeton de confirmation d email.',
    de = 'Wenn Ihre E-Mail (Benutzername) nicht geändert wurde, überprüfen Sie bitte die App, um einen neuen E-Mail-Bestätigungstoken anzufordern.',
    pt = 'Se seu email (nome de usuário) não foi alterado, verifique o aplicativo para solicitar um novo token de confirmação de email.',
    cs = 'Pokud se e-mail (uživatelské jméno) nezměnil, zkontrolujte aplikaci, zda požádáte o nový token pro potvrzení e-mailu.',
    fi = 'Jos sähköpostisi (käyttäjänimi) ei ole muuttunut, tarkista sovellus pyytääksesi uuden sähköpostivahvistustokenin.',
  }

  const { token, username } = req.params
  const language = req.query.lang || 'en'

  try {
    // Validate the token
    const user = await User.findOneAndUpdate({ confirmToken: token }, { username })

    if (!user) {
      res.send(`
      <!DOCTYPE html>
      <html lang=${language}>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style> 
      @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Oswald:wght@500;600&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
        body {
          font-family: Lato, Helvetica, Arial, sans-serif;
          background-color: hsl(219, 100%, 10%);
          color: white;
          letter-spacing: -0.03em;
          display:flex;
          justify-content:center;
          align-items:center;
          min-height: 100vh;
        }
        body > div {
          margin: 0 auto;
          max-width: 800px;  
        }
        h1 {
          font-family: Oswald, Lato, Helvetica, Arial, sans-serif;
          text-align: center;
        }
        p {
          font-size: 18px;
          text-align: center;
        }
        a {
          color: white;
        }
      </style>
      <title>
      ${EJenniinaFi[(language as ELanguage) || 'en']}</title>
      </head>
      <body>
        <div>
          <h1>
            ${EInvalidOrMissingToken[language as ELanguage] || 'Invalid or expired token'}
          </h1>
          <p>${
            ELogInAtTheAppOrRequestANewEmailConfirmToken[(language as ELanguage) || 'en']
          }</p> 
          <p>
          <a href=${process.env.SITE_URL}/?login=login>${
        EBackToTheApp[language as ELanguage] ?? 'Back to the app'
      }</a>
          </p>
        </div>
      </body>
      </html>
      `)
    } else if (user) {
      user.verified = true
      user.confirmToken = undefined
      user.markModified('verified')
      user.markModified('confirmToken')
      await user.save()

      const htmlResponse = `
      <html lang=${language ?? 'en'}>
      <head> 
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style> 
        @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Oswald:wght@500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
          body {
            font-family: Lato, Helvetica, Arial, sans-serif;
            background-color: hsl(219, 100%, 10%);
            color: white;
            letter-spacing: -0.03em;
            display:flex;
            justify-content:center;
            align-items:center;
            min-height: 100vh;
          }
          body > div {
            margin: 0 auto;
            max-width: 800px;  
          }
          h1, h2 {
            font-family: Oswald, Lato, Helvetica, Arial, sans-serif;
            text-align: center;
          }
          p {
            font-size: 18px;
            text-align: center;
          }
          a {
            color: white;
          }
        </style>
        <title>
        ${EJenniinaFi[(language as ELanguage) || 'en']}</title>
      </head>
        <body>
          <div>
            <h1>${EJenniinaFi[(language as ELanguage) || 'en']}</h1>
            <h2>${EEmailConfirmed[(language as ELanguage) || 'en']}</h2>
            <p>${EEmailHasBeenConfirmed[(language as ELanguage) || 'en']}</p>
            <p>
            <a href=${process.env.SITE_URL}/?login=login>${
        EBackToTheApp[(language as ELanguage) || 'en']
      }</a>
            </p>
          </div>
        </body>
      </html>
      `
      res.send(htmlResponse)
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Internal Server Error *' })
  }
}

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      // params: { _id: _id },
      body,
    } = req

    const { password, _id } = body
    const user = await User.findById(_id)
    if (user && password) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      user.password = hashedPassword
      user.markModified('password')
      user.name = body.name ?? user.name
      user.markModified('name')
      user.set('language', body.language)
      const updatedUser = await user.save()
      res.status(200).json({
        success: true,
        message: `${
          EUserUpdated[(updatedUser?.language as unknown as ELanguage) || 'en']
        }!`,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          language: updatedUser.language,
          role: updatedUser.role,
          verified: updatedUser.verified,
        },
      })
    } else if (user && !password) {
      user.name = body.name ?? user.name
      user.markModified('name')
      user.set('language', body.language ?? 'en')
      const updatedUser: IUser = await user.save()
      res.status(200).json({
        success: true,
        message: `${
          EUserUpdated[(updatedUser?.language as unknown as ELanguage) || 'en']
        }!`,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          language: updatedUser.language,
          role: updatedUser.role,
          verified: updatedUser.verified,
        },
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      success: false,
      message: `${EError[(req.body.language as ELanguage) || 'en']} ¤`,
    })
  }
}

const comparePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  enum ECurrentPasswordWrong {
    en = 'Current password wrong',
    es = 'Contraseña actual incorrecta',
    fr = 'Mot de passe actuel incorrect',
    de = 'Aktuelles Passwort falsch',
    pt = 'Senha atual errada',
    cs = 'Aktuální heslo špatně',
    fi = 'Nykyinen salasana väärin',
  }
  const comparePassword = async function (
    this: IUser,
    candidatePassword: string
  ): Promise<boolean> {
    try {
      const isMatch: boolean = await bcrypt.compare(candidatePassword, this.password!)
      return isMatch
    } catch (error) {
      console.error('Error:', error)
      return false
    }
  }
  try {
    const { _id, passwordOld, language } = req.body
    const user: IUser | null = await User.findById(_id)

    // if (!user) {
    //   res.status(404).json({ success: false, message: 'User not found ~' })
    //   return
    // }
    if (user) {
      const passwordMatch: boolean = await comparePassword.call(user, passwordOld)

      if (passwordMatch) {
        // console.log('Password match', passwordMatch)
        // res.status(200).json({ message: 'Password match' })

        next()
      } else {
        res.status(401).json({
          success: false,
          message: `${ECurrentPasswordWrong[(language as ELanguage) || 'en']}`,
        })
      }
    }
  } catch (error) {
    console.error('Error:', error)
    res
      .status(500)
      .json({ success: false, message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const loginUser = async (req: Request, res: Response): Promise<void> => {
  const comparePassword = async function (
    this: IUser,
    candidatePassword: string
  ): Promise<boolean> {
    try {
      const isMatch: boolean = await bcrypt.compare(candidatePassword, this.password!)
      return isMatch
    } catch (error) {
      console.error('Error:', error)
      return false
    }
  }

  const { username, password, language } = req.body
  const user: IUser | null = await User.findOne({ username })

  if (!user) {
    res.status(401).json({
      message:
        `${EInvalidLoginCredentials[language as ELanguage]}` ||
        'Invalid login credentials - ',
    })
  } else if (user?.verified) {
    const passwordMatch: boolean = await comparePassword.call(user, password)
    if (passwordMatch) {
      const token = await generateToken(user._id)
      console.log('token', token)
      res.status(200).json({
        success: true,
        message: ESuccessfullyLoggedIn[user.language || 'en'],
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          language: user.language,
          role: user.role,
          verified: user.verified,
        },
        token,
      })
    } else {
      res.status(401).json({
        success: false,
        message: EInvalidLoginCredentials[user.language || 'en'],
      })
    }
  } else if (!user?.verified && !user?.token) {
    try {
      const refresh = await refreshExpiredToken(req, user._id)
      if (refresh?.success) {
        res.status(401).json({ success: false, message: refresh.message, user })
        // res
        //   .status(401)
        //   .json({ success: false, message: 'User not verified. Please check your email ¤' })
      } else {
        res.status(401).json({ success: false, message: refresh?.message })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: EError[(req.body.language as ELanguage) || 'en'],
      })
    }
  } else if (user?.token && !user?.verified) {
    const decoded = verifyToken(user.token)
    if (decoded?.exp && decoded?.exp < Date.now() / 1000) {
      try {
        //generate new token
        const refresh = await refreshExpiredToken(req, user._id)
        if (refresh?.success) {
          res.status(401).json({
            success: false,
            message: refresh.message,
            user: {
              _id: user._id,
              name: user.name,
              username: user.username,
              language: user.language,
              role: user.role,
              verified: user.verified,
            },
            token: user.token,
          })
        } else {
          res.status(401).json({ success: false, message: refresh?.message })
        }
      } catch (error) {
        console.error(error)
        res
          .status(500)
          .json({ message: EError[(req.body.language as ELanguage) || 'en'] })
      }
    } else if (!user.verified) {
      //generate new token
      const refresh = await refreshExpiredToken(req, user._id)
      if (refresh?.success) {
        res.status(401).json({
          success: false,
          message: refresh.message,
          user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            language: user.language,
            role: user.role,
            verified: user.verified,
          },
          token: user.token,
        })
      } else {
        console.log(refresh?.message)
        res.status(401).json({ success: false, message: refresh?.message })
      }
      // res.status(401).json({ message: 'User not verified. Please check your email' })
    }
  }
}

const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.body
  const language = req.body.language || 'en'
  const user: IUser | null = await User.findOne({ username })
  if (!user) {
    console.log('User not found')
    res.status(401).json({ success: false, message: EError[language as ELanguage] })
  } else if (user) {
    try {
      // const secret = process.env.JWT_SECRET || 'jgtrshdjfshdf'
      // const userId = { userId: user._id }
      //const token = jwt.sign(userId, secret, { expiresIn: '1d' })
      //const token = '1234567890'
      const token = await generateToken(user._id)
      const link = `${process.env.BASE_URI}/api/users/reset/${token}?lang=${language}`
      //User.findOneAndUpdate({ username }, { $set: { resetToken: token } })
      await User.findOneAndUpdate({ username }, { resetToken: token })
      sendMail(
        EPasswordReset[language as unknown as ELanguage],
        EResetPassword[language as unknown as ELanguage],
        username,
        language as unknown as ELanguage,
        link
      )
        .then((result) => {
          console.log('result ', result)
          res.status(200).json({
            success: true,
            message: ETokenSent[language as unknown as ELanguage] || 'Token sent',
          })
        })
        .catch((error) => {
          console.log(error)
          res.status(500).json({
            success: false,
            message:
              EErrorSendingMail[language as unknown as ELanguage] || 'Error sending mail',
          })
        })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({
        success: false,
        message: EError[(language as unknown as ELanguage) || 'en'] || 'Error ¤',
      })
    }
  } else {
    res
      .status(401)
      .json({ success: false, message: `${EError[language as ELanguage]} *` })
  }
}

// }

// const loginUser = async (req: Request, res: Response): Promise<void> => {
//   const comparePassword = async function (
//     this: IUser,
//     candidatePassword: string
//   ): Promise<boolean> {
//     try {
//       const isMatch: boolean = await bcrypt.compare(candidatePassword, this.password!)
//       return isMatch
//     } catch (error) {
//       console.error('Error:', error)
//       return false
//     }
//   }
//   try {
//     const { username, password } = req.body
//     const user: IUser | null = await User.findOne({ username })
//     if (!user) {
//       res.status(401).json({ message: 'User not found' })
//     } else if (!user.verified) {
//       res.status(401).json({ message: 'User not verified. Please check your email' })
//     } else {
//       const passwordMatch: boolean = await comparePassword.call(user, password)
//       if (passwordMatch) {
//         res.status(200).json({ message: 'User logged in' })
//       } else {
//         res.status(401).json({ message: 'Invalid login credentials' })
//       }
//     }
//   } catch (error) {
//     console.error('Error:', error)
//     res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
//   }
// }

const registerUser = async (req: Request, res: Response): Promise<void> => {
  //User.collection.dropIndex('jokes_1')
  // try {

  enum EMessage {
    en = 'User registered. Please check your email for the verification link',
    es = 'Usuario registrado. Por favor, compruebe su correo electrónico para el enlace de verificación',
    fr = 'Utilisateur enregistré. Veuillez vérifier votre email pour le lien de vérification',
    de = 'Benutzer registriert. Bitte überprüfen Sie Ihre E-Mail für den Bestätigungslink',
    pt = 'Usuário registrado. Por favor, verifique seu email para o link de verificação',
    cs = 'Uživatel registrován. Prosím, zkontrolujte svůj email pro ověřovací odkaz',
    fi = 'Käyttäjä rekisteröity. Tarkista sähköpostisi vahvistuslinkkiä varten',
  }

  const { name, username, password, jokes, language } = req.body
  const saltRounds = 10

  enum ERegistrationFailed {
    en = 'Registration failed',
    es = 'Registro fallido',
    fr = 'Inscription échouée',
    de = 'Registrierung fehlgeschlagen',
    pt = 'Registro falhou',
    cs = 'Registrace se nezdařila',
    fi = 'Rekisteröinti epäonnistui',
  }
  enum EPleaseCheckYourEmailIfYouHaveAlreadyRegistered {
    en = 'Please check your email if you have already registered',
    es = 'Por favor, compruebe su correo electrónico si ya se ha registrado',
    fr = 'Veuillez vérifier votre email si vous êtes déjà inscrit',
    de = 'Bitte überprüfen Sie Ihre E-Mail, wenn Sie sich bereits registriert haben',
    pt = 'Por favor, verifique seu email se você já se registrou',
    cs = 'Zkontrolujte svůj email, pokud jste se již zaregistrovali',
    fi = 'Tarkista sähköpostisi, jos olet jo rekisteröitynyt',
  }
  try {
    bcrypt
      .hash(password, saltRounds)
      .then((hashedPassword) => {
        return User.findOne({ username })
          .then(async (user) => {
            if (user) {
              res.status(401).json({
                message:
                  `${ERegistrationFailed[user.language]}. ${
                    EPleaseCheckYourEmailIfYouHaveAlreadyRegistered[user.language]
                  }` ||
                  'Registration failed, Please check your email if you have already registered',
              })
            } else {
              const newUser = new User({
                name,
                username,
                password: hashedPassword,
                jokes,
                language,
                verified: false,
              })

              // const secret = process.env.JWT_SECRET || 'jgtrshdjfshdf'
              // jwt.sign(
              //   { userId: newUser._id },
              //   secret,
              //   { expiresIn: '1d' },
              //   (err, token) => {
              //     if (err) {
              //       console.error(err)
              //       res.status(500).json({
              //         message:
              //           EErrorCreatingToken[newUser?.language] || 'Error creating token',
              //       })
              // } else {
              const token = await generateToken(newUser._id)
              const link = `${process.env.BASE_URI}/api/users/verify/${token}?lang=${language}`
              newUser.token = token

              sendMail(
                EHelloWelcome[language as ELanguage],
                EEmailMessage[language as ELanguage],
                username,
                language,
                link
              )
                .then((result) => {
                  newUser.save().then((user: IUser) => {
                    res.status(201).json({
                      success: true,
                      user: {
                        _id: user._id,
                        name: user.name,
                        username: user.username,
                        language: user.language,
                        role: user.role,
                        verified: user.verified,
                      },
                      message: EMessage[language as ELanguage] || 'User registered',
                    })
                  })
                })
                .catch((error) => {
                  console.log(error)
                  res.status(500).json({
                    message:
                      EErrorSendingMail[language as ELanguage] || 'Error sending mail',
                  })
                })
              // }
            }
            // )
            // }
          })
          .catch((error) => {
            console.error(error)
            res.status(500).json({
              success: false,
              message: EError[(language as ELanguage) || 'en'] || 'An error occurred',
            })
          })
      })
      .catch(async (error) => {
        console.error(error)
        if (error.message === 'Token expired') {
          const user = await User.findOne({ username })
          const refresh = await refreshExpiredToken(req, user?._id)
          res.status(401).json({ success: false, message: refresh?.message })
        } else {
          const language = req.body.language || 'en'
          res.status(500).json({
            success: false,
            message: EError[language as ELanguage] || 'An error occurred *',
          })
        }
      })
  } catch (error) {
    console.error('Error:', error)
    if ((error as Error).message === 'Token expired') {
      const user = await User.findOne({ username })
      const refresh = await refreshExpiredToken(req, user?._id)
      if (refresh?.success) {
        res.status(401).json({ success: true, message: refresh.message })
      } else {
        res.status(401).json({ success: false, message: refresh?.message })
      }
    } else {
      const language = req.body.language || 'en'
      res.status(500).json({
        success: false,
        message: EError[language as ELanguage] || 'An error occurred ¤',
      })
    }
  }
}

// const refreshExpiredToken = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1] as IToken['token']
//     if (!token) throw new Error('No token provided')

//     // Verify the expired token and get the user ID
//     const decoded = verifyToken(token)

//     // Create a new token for the user
//     const newToken = generateToken(decoded?.userId)

//     // Send the new token back to the client
//     res.status(200).json({ newToken })
//   } catch (error) {
//     console.error('Error:', error)
//     res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
//   }
// }

type TRefreshExpiredToken = {
  success: boolean
  message: string
  newToken?: string
  user?: Pick<IUser, '_id' | 'name' | 'username' | 'language' | 'role' | 'verified'>
}

const refreshExpiredToken = async (
  req: Request,
  _id: IUser['_id']
): Promise<TRefreshExpiredToken> => {
  const body = req.body

  const getUserById_ = async (userId: string | undefined): Promise<IUser | undefined> => {
    const user = await User.findById(userId)
    if (user) return user
    else return undefined
  }

  enum ENewTokenSentToEmail {
    en = 'New token sent to email',
    es = 'Nuevo token enviado al correo electrónico',
    fr = 'Nouveau jeton envoyé par email',
    de = 'Neuer Token an E-Mail gesendet',
    pt = 'Novo token enviado para o email',
    cs = 'Nový token odeslán na email',
    fi = 'Uusi token lähetetty sähköpostitse',
  }
  enum EUserNotVerified {
    en = 'User not verified. Please check your email',
    es = 'Usuario no verificado. Por favor, compruebe su correo electrónico',
    fr = 'Utilisateur non vérifié. Veuillez vérifier votre email',
    de = 'Benutzer nicht verifiziert. Bitte überprüfen Sie Ihre E-Mail',
    pt = 'Usuário não verificado. Por favor, verifique seu email',
    cs = 'Uživatel není ověřen. Zkontrolujte svůj email',
    fi = 'Käyttäjää ei ole vahvistettu. Tarkista sähköpostisi',
  }

  return new Promise((resolve, reject) => {
    try {
      let token = req.headers.authorization?.split(' ')[1] as IToken['token'] as
        | string
        | undefined
      if (!token) {
        getUserById_(_id)
          .then(async (user) => {
            if (user?.token) {
              token = user.token
            } else {
              token = await generateToken(_id)
              if (!user?.verified) {
                const link = `${process.env.BASE_URI}/api/users/verify/${token}?lang=${body.language}`
                sendMail(
                  EHelloWelcome[body.language as keyof typeof EHelloWelcome],
                  EEmailMessage[body.language as keyof typeof EEmailMessage],
                  body.username,
                  body.language as unknown as ELanguage,
                  link
                )
                  .then((r) => {
                    reject({
                      success: false,
                      message:
                        `${EEmailMessage[body.language as keyof typeof EEmailMessage]} *,
                        ${
                          ENewTokenSentToEmail[
                            body.language as keyof typeof ENewTokenSentToEmail
                          ]
                        }` || 'Token sent',
                      user: {
                        _id: user?._id,
                        name: user?.name,
                        username: user?.username,
                        language: user?.language,
                        role: user?.role,
                        verified: user?.verified,
                      },
                    })
                  })
                  .catch((error) => {
                    console.error(error)
                    reject({
                      success: false,
                      message:
                        EErrorSendingMail[req.body.language as ELanguage] ||
                        'Error sending mail ¤',
                    })
                  })
              }
              // reject(new Error('No token provided'))
              // return
            }
          })
          .catch((error) => {
            console.error(error)
            reject({
              success: false,
              message: EError[(req.body.language as ELanguage) || 'en'] || '¤ Error',
            })
          })
      } else {
        // Verify the expired token and get the user ID
        const decoded = verifyToken(token)

        //// Create a new token for the user
        //const newToken = generateToken(decoded?.userId)

        //// Send the new token back to the client
        //resolve({ success: true, message: 'Token refreshed successfully', newToken })

        // Save the new token to the user
        getUserById_(decoded?.userId)
          .then((user) => {
            if (!user) {
              reject(
                new Error(
                  `${
                    EErrorCreatingToken[body.language as keyof typeof EErrorCreatingToken]
                  } *`
                )
              )
              return
            } else {
              // const secret = process.env.JWT_SECRET || 'jgtrshdjfshdf'
              // jwt.sign(
              //   { userId: user._id },
              //   secret,
              //   { expiresIn: '1d' },
              //   (err, token) => {
              //     if (err) {
              //       console.error(err)
              //       reject({
              //         success: false,
              //         message:
              //           EErrorCreatingToken[req.body.language as ELanguage] ||
              //           'Error creating token',
              //       })
              //     } else {
              user.token = token

              const link = `${process.env.BASE_URI}/api/users/verify/${token}?lang=${req.body.language}`
              user
                .save()
                .then(() => {
                  sendMail(
                    EHelloWelcome[body.language as keyof typeof EHelloWelcome],
                    EEmailMessage[body.language as keyof typeof EHelloWelcome],
                    user.username,
                    body.language as unknown as ELanguage,
                    link
                  )
                })
                .then((r) => {
                  resolve({
                    success: true,
                    message:
                      ` ${
                        EUserNotVerified[
                          req.body.language as keyof typeof EUserNotVerified
                        ]
                      }. ${
                        ENewTokenSentToEmail[
                          body.language as keyof typeof ENewTokenSentToEmail
                        ]
                      }` || 'New link sent to email',
                    user: {
                      _id: user._id,
                      name: user.name,
                      username: user.username,
                      language: user.language,
                      role: user.role,
                      verified: user.verified,
                    },
                  })
                })
                .catch((error) => {
                  console.error(error)
                  reject({
                    success: false,
                    message:
                      EErrorSendingMail[req.body.language as ELanguage] ||
                      'Error sending mail ¤',
                  })
                })
            }
            // }
            // )
            // }
          })
          .catch((error) => {
            console.error(error)
            reject({
              success: false,
              message: EError[(req.body.language as ELanguage) || 'en'] || '¤ Error',
            })
          })
      }
    } catch (error) {
      console.error('Error:', error)
      reject({
        success: false,
        message: EError[(req.body.language as ELanguage) || 'en'],
      })
    }
  })
}

// const refreshExpiredTokenOriginal = async (req: Request) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1] as IToken['token']
//     if (!token) throw new Error('No token provided')

//     // Verify the expired token and get the user ID
//     const decoded = verifyToken(token)

//     // Create a new token for the user
//     const newToken = generateToken(decoded?.userId)

//     // // Send the new token back to the client
//     //return { success: true, message: 'Token refreshed successfully', newToken }

//     const body = req.body as Pick<IUser, 'username' | 'language'>
//     const secret = process.env.JWT_SECRET || 'jgtrshdjfshdf'

//     const user = await User.findOne({ username: body.username })
//     if (!user) {
//       return { success: false, message: `${EErrorCreatingToken[body.language]} *` }
//     } else {
//       // try {
//       jwt.sign({ userId: user?._id }, secret, { expiresIn: '1d' }, (err, token) => {
//         if (err) {
//           console.error(err)
//           return {
//             success: false,
//             message: EErrorCreatingToken[body.language] || 'Error creating token',
//           }
//         } else {
//           user.token = token

//           const link = `${process.env.BASE_URI}/api/users/verify/${token}?lang=${body.language}`

//           user
//             .save()
//             .then(() =>
//               sendMail(body.username, body.language as unknown as ELanguage, link)
//             )
//             .then((r) => {
//               console.log('Ärrä', r)
//               return {
//                 success: true,
//                 message: ETokenSent[body.language] || 'Token sent',
//                 user,
//               }
//             })
//             .catch((error) => {
//               console.log(error)
//               return {
//                 success: false,
//                 message: EErrorSendingMail[body.language] || 'Error sending mail ¤',
//               }
//             })
//         }
//       })
//       // } catch (error) {
//       //   console.error('Error:', error)
//       //   return {
//       //     success: false,
//       //     message: EError[(req.body.language as ELanguage) || 'en'] || '¤ Error',
//       //   }
//       // }
//     }
//   } catch (error) {
//     console.error('Error:', error)
//     return {
//       success: false,
//       message:
//         EError[(req.body.language as ELanguage) || 'en'] || 'Error refreshing token',
//     }
//   }
// }

const requestNewToken = async (req: Request, res: Response): Promise<void> => {
  const language = req.body.language || req.query.lang || 'en'
  if (!req.body.username) {
    res
      .status(400)
      .json({ success: false, message: EUsernameRequired[language as ELanguage] })
    return
  }
  const username = req.body.username
  try {
    const user = await User.findOne({ username })
    if (!user) {
      res
        .status(404)
        .json({ success: false, message: `${EError[language as ELanguage]} -` })
      return
    }
    const token = await generateToken(user._id)
    if (token) {
      res.json({
        success: true,
        message: `${EError[language as ELanguage]}. ${EErrorCreatingToken} ~`,
        token,
      })
    } else {
      res.status(500).json({
        success: false,
        message: `${EError[language as ELanguage]}. ${EErrorCreatingToken} ¤`,
      })
    }
  } catch {
    res.status(500).json({
      success: false,
      message: `${EError[language as ELanguage]}. ${EErrorCreatingToken} *`,
    })
  }
}

// const hashedPassword = await bcrypt.hash(password, saltRounds)
//     const user: IUser | null = await User.findOne({ username })
//     if (user) {
//       res.status(401).json({ message: 'Cannot register' })
//     } else {
//       const newUser: IUser = new User({
//         username,
//         password: hashedPassword,
//         jokes,
//         language,
//         verified: false,
//       })

//       enum EHelloWelcome {
//         en = "Hello, welcome to the Comedian's Companion",
//         es = 'Hola, bienvenido al Compañero del Comediante',
//         fr = 'Bonjour, bienvenue au Compagnon du Comédien',
//         de = 'Hallo, willkommen beim Begleiter des Komikers',
//         pt = 'Olá, bem-vindo ao Companheiro do Comediante',
//         cs = 'Ahoj, vítejte u Společníka komika',
//       }
//       enum EEmailMessage {
//         en = 'Please verify your email',
//         es = 'Por favor verifica tu correo electrónico',
//         fr = 'Veuillez vérifier votre email',
//         de = 'Bitte überprüfen Sie Ihre E-Mail',
//         pt = 'Por favor, verifique seu email',
//         cs = 'Prosím, ověřte svůj email',
//       }
//       enum EMessage {
//         en = 'User registered. Please check your email for the verification link',
//         es = 'Usuario registrado. Por favor, compruebe su correo electrónico para el enlace de verificación',
//         fr = 'Utilisateur enregistré. Veuillez vérifier votre email pour le lien de vérification',
//         de = 'Benutzer registriert. Bitte überprüfen Sie Ihre E-Mail für den Bestätigungslink',
//         pt = 'Usuário registrado. Por favor, verifique seu email para o link de verificação',
//         cs = 'Uživatel registrován. Prosím, zkontrolujte svůj email pro ověřovací odkaz',
//       }

//       const secret: Secret = process.env.JWT_SECRET || 'jgtrshdjfshdf'

//       const token = jwt.sign({ userId: newUser._id }, secret, { expiresIn: '1d' })

//       const link = `${process.env.BASE_URI}/api/users/verify/${token}?lang=${language}`

//       newUser.token = token

//       const sendMail = (): Promise<any> => {
//         return new Promise((resolve, reject) => {
//           transporter.sendMail(
//             {
//               from: `${process.env.NODEMAILER_USER}`,
//               to: username,
//               subject: EHelloWelcome[language as ELanguage],
//               text: `${EEmailMessage[language as ELanguage]}: ${link}`,
//             },
//             (error: Error | null, info: any) => {
//               if (error) {
//                 console.log(error)
//                 reject(error)
//                 res
//                   .status(500)
//                   .json({ message: EError[(req.body.language as ELanguage) || 'en'] })
//               } else {
//                 console.log('Email sent: ' + info.response)
//                 resolve(info.response)
//                 res.status(201).json({
//                   message: EMessage[language as ELanguage],
//                 })
//               }
//             }
//           )
//         })
//       }
//       enum EErrorSendingMail {
//         en = 'Error sending mail',
//         es = 'Error al enviar el correo',
//         fr = 'Erreur lors de l envoi du mail',
//         de = 'Fehler beim Senden der E-Mail',
//         pt = 'Erro ao enviar email',
//         cs = 'Chyba při odesílání emailu',
//       }
//       sendMail()
//         .then((result) => {
//           newUser.save()
//           console.log(result)
//         })
//         .catch((error) => {
//           console.log(error)
//           res.status(500).json({
//             message: EErrorSendingMail[(req.body.language as ELanguage) || 'en'],
//           })
//         })

//       // await transporter.sendMail({
//       //   from: `${process.env.NODEMAILER_USER}`,
//       //   to: username,
//       //   subject: EHelloWelcome[language as ELanguage],
//       //   text: `${EEmailMessage[language as ELanguage]}: ${link}`,
//       // })

//       // res.status(201).json({
//       //   message: EMessage[language as ELanguage],
//       // })
//     }
//   } catch (error) {
//     console.error('Error:', error)
//     const language = req.body.language || 'en'
//     res.status(500).json({ error, message: EError[language as ELanguage] })
//   }
// }

const verifyEmailToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token
    const user = await User.findOne({ token: token })

    if (user) {
      // Mark the user as verified and remove the verification token
      user.verified = true
      user.token = undefined
      await user.save()

      //res.redirect('/api/users/verification-success')

      enum EVerificationSuccessful {
        en = 'Verification Successful',
        es = 'Verificación exitosa',
        fr = 'Vérification réussie',
        de = 'Verifizierung erfolgreich',
        pt = 'Verificação bem-sucedida',
        cs = 'Úspěšná verifikace',
        fi = 'Vahvistus onnistui',
      }

      enum EAccountSuccessfullyVerified {
        en = 'Your account has been successfully verified',
        es = 'Su cuenta ha sido verificada con éxito',
        fr = 'Votre compte a été vérifié avec succès',
        de = 'Ihr Konto wurde erfolgreich verifiziert',
        pt = 'Sua conta foi verificada com sucesso',
        cs = 'Váš účet byl úspěšně ověřen',
        fi = 'Tilisi on vahvistettu onnistuneesti',
      }

      // let urlParams =
      //   typeof window !== 'undefined'
      //     ? new URLSearchParams(window.location.search)
      //     : undefined
      // let language = urlParams?.get('lang')

      const language = req.query.lang || 'en'
      const htmlResponse = `
    <html lang=${language ?? 'en'}>
      <head>
      
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style> 
        @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Oswald:wght@500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
          body {
            font-family: Lato, Helvetica, Arial, sans-serif;
            background-color: hsl(219, 100%, 10%);
            color: white;
            letter-spacing: -0.03em;
            display:flex;
            justify-content:center;
            align-items:center;
            min-height: 100vh;
          }
          body > div {
            margin: 0 auto;
            max-width: 800px;  
          }
          h1 {
            font-family: Oswald, Lato, Helvetica, Arial, sans-serif;
            text-align: center;
          }
          p {
            font-size: 18px;
            text-align: center;
          }
          a {
            color: white;
          }
        </style>
        <title>
        ${EJenniinaFi[(language as ELanguage) || 'en']}</title>
      </head>
      <body>
      <div>
        <h1>${
          EVerificationSuccessful[language as ELanguage] ?? 'Verification successful'
        }</h1>
        <p>${
          EAccountSuccessfullyVerified[language as ELanguage] ??
          'Account successfully verified'
        }.</p>
        <p>
        <a href=${process.env.SITE_URL}/?login=login>${
        EBackToTheApp[language as ELanguage] ?? 'Back to the app'
      }</a>
        </p>
      </div>
      </body>
    </html>
  `
      res.send(htmlResponse)
    } else {
      const language = req.query.lang || 'en'

      enum EVerificationFailed {
        en = 'Already verified or verification token expired',
        es = 'Ya verificado o token de verificación caducado',
        fr = 'Déjà vérifié ou jeton de vérification expiré',
        de = 'Bereits verifiziert oder Verifizierungstoken abgelaufen',
        pt = 'Já verificado ou token de verificação expirado',
        cs = 'Již ověřeno nebo vypršel ověřovací token',
        fi = 'Jo vahvistettu, tai vahvistustoken on vanhentunut',
      }
      // const urlParams =
      //   typeof window !== 'undefined'
      //     ? new URLSearchParams(window.location.search)
      //     : undefined
      // const language = urlParams?.get('lang')

      const htmlResponse = `
    <html lang=${language ?? 'en'}>
      <head>
        <style> 
        @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Oswald:wght@500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
          body {
            font-family: Lato, Helvetica, Arial, sans-serif;
            background-color: hsl(219, 100%, 10%);
            color: white;
            letter-spacing: -0.03em;
            display:flex;
            justify-content:center;
            align-items:center;
            min-height: 100vh;
          }
          body > div {
            margin: 0 auto;
            max-width: 800px; 
          }
          h1 {
            font-family: Oswald, Lato, Helvetica, Arial, sans-serif;
            text-align: center;
          }
          p {
            font-size: 18px;
            text-align: center;
          }
          a {
            color: white;
          }
        </style> 
      </head>
      <body>
      <div>
        <h1>${EVerificationFailed[language as ELanguage]}</p>
        <p>
        <a href=${process.env.SITE_URL}>${
        EBackToTheApp[language as ELanguage] ?? 'Back to the app'
      }</a>
        </p>
      </div>
      </body>
    </html>
  `
      res.send(htmlResponse)
      //res.status(400).json({ message: 'Invalid verification token' })
    }
  } catch (error) {
    console.error('Error:', error)
    res
      .status(500)
      .json({ success: false, message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

// const verificationSuccess = async (req: Request, res: Response): Promise<void> => {
//   const urlParams = new URLSearchParams(window.location.search)
//   const language = urlParams.get('lang')

//   enum EVerificationSuccessful {
//     en = 'Verification Successful',
//     es = 'Verificación exitosa',
//     fr = 'Vérification réussie',
//     de = 'Verifizierung erfolgreich',
//     pt = 'Verificação bem-sucedida',
//     cs = 'Úspěšná verifikace',
//   }

//   enum EAccountSuccessfullyVerified {
//     en = 'Your account has been successfully verified',
//     es = 'Su cuenta ha sido verificada con éxito',
//     fr = 'Votre compte a été vérifié avec succès',
//     de = 'Ihr Konto wurde erfolgreich verifiziert',
//     pt = 'Sua conta foi verificada com sucesso',
//     cs = 'Váš účet byl úspěšně ověřen',
//   }

//   enum EBackToTheApp {
//     en = 'Back to the App',
//     es = 'Volver a la aplicación',
//     fr = 'Retour à l application',
//     de = 'Zurück zur App',
//     pt = 'Voltar para o aplicativo',
//     cs = 'Zpět do aplikace',
//   }

//   const htmlResponse = `
//     <html lang=${language ?? 'en'}>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//         @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Oswald:wght@500;600&display=swap');
//         @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
//           body {
//             font-family: Lato, Helvetica, Arial, sans-serif;
//             background-color: hsl(219, 100%, 10%);
//             color: white;
//             letter-spacing: -0.03em;
//             display:flex;
//             justify-content:center;
//             align-items:center;
//             min-height: 100vh;
//           }
//           body > div {
//             margin: 0 auto;
//             max-width: 800px;
//           }
//           h1 {
//             font-family: Oswald, Lato, Helvetica, Arial, sans-serif;
//           }
//           p {
//             font-size: 18px;
//           }
//         </style>
//         <title>${EJenniinaFi[language as ELanguage || 'en']}</title>
//       </head>
//       <body>
//       <div>
//         <h1>${EVerificationSuccessful[language as ELanguage]}</h1>
//         <p>${EAccountSuccessfullyVerified}.</p>
//         <p>
//         <a href=${process.env.SITE_URL}>${EBackToTheApp[language as ELanguage]}</a>
//         </p>
//       </div>
//       </body>
//     </html>
//   `
//   res.send(htmlResponse)
// }

const findUserByUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const userByUsername: IUser | null = await User.findOne({
      username: req.params.username,
    })
    res.status(200).json({
      user: {
        _id: userByUsername?._id,
        name: userByUsername?.name,
        username: userByUsername?.username,
        language: userByUsername?.language,
        role: userByUsername?.role,
        verified: userByUsername?.verified,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    res
      .status(500)
      .json({ success: false, message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}
// const findUserByUsername = async (username: string): Promise<IUser | null> => {
//   try {
//     const userByUsername = await User.findOne({ username })
//     return userByUsername || null
//   } catch (error) {
//     console.error('Error:', error)
//     return null
//   }
// }

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const language = req.body.language || req.query.lang || 'en'
  try {
    res.status(200).json({
      success: true,
      message: EYouHaveLoggedOut[language as ELanguage],
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ success: false, message: EError[language as ELanguage] })
  }
}

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params
  const language = req.query.lang || 'en'

  try {
    // Validate the token
    const user = await User.findOne({ resetToken: token })

    if (!user) {
      res.send(`
      <!DOCTYPE html>
      <html lang=${language}>
      <head>
      
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style> 
        @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Oswald:wght@500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
          body {
            font-family: Lato, Helvetica, Arial, sans-serif;
            background-color: hsl(219, 100%, 10%);
            color: white;
            letter-spacing: -0.03em;
            display:flex;
            justify-content:center;
            align-items:center;
            min-height: 100vh;
          }
          body > div {
            margin: 0 auto;
            max-width: 800px;  
          }
          h1 {
            font-family: Oswald, Lato, Helvetica, Arial, sans-serif;
            text-align: center;
          }
          p {
            font-size: 18px;
            text-align: center;
          }
          a {
            color: white;
          }
        </style>
        <title>
        ${EJenniinaFi[(language as ELanguage) || 'en']}</title>
      </head>
      <body>
      <div>
        <h1>
          ${EInvalidOrMissingToken[language as ELanguage] || 'Invalid or expired token'}
        </h1>
        <p>${
          ELogInAtTheAppOrRequestANewPasswordResetToken[language as ELanguage] ||
          'Check the app to request a new password reset token. '
        }</p> 
        <p>
        <a href=${process.env.SITE_URL}>${
        EBackToTheApp[language as ELanguage] ?? 'Back to the app'
      }</a>
        </p>
      </div>
      </body>
    </html>
    `)
      // res.status(400).json({
      //   success: false,
      //   message:
      //     `${EInvalidOrMissingToken[language as ELanguage]}. ${
      //       ELogInAtTheAppOrRequestANewPasswordResetToken[language as ELanguage]
      //     }` || 'Invalid or expired token',
      // })
    } else if (user) {
      const htmlResponse = `
    <html lang=${language}>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style> 
        @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Oswald:wght@500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
          body {
            font-family: Lato, Helvetica, Arial, sans-serif;
            font-size:20px;
            background-color: hsl(219, 100%, 10%);
            color: white;
            letter-spacing: -0.03em;
            display:flex;
            justify-content:center;
            align-items:center;
            min-height: 100vh;
          }
          body > div {
            margin: 0 auto;
            max-width: 800px;  
          }
          h1, h2 {
            font-family: Oswald, Lato, Helvetica, Arial, sans-serif;
            text-align: center;
          }
          p {
            font-size: 18px;
            text-align: center;
          }
          a {
            color: white;
          }
          form {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap:1.6rem;
          }
          form > div {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap:0.6rem;
          }
          input {
            padding: 0.6rem;
            border-radius: 2rem;
            border: none;
            background-color: hsl(219, 100%, 20%);
            color: white;
            font-size: 1.2rem;
          }
          button {
            padding: 0.6rem;
            border-radius: 2rem;
            border: none;
            background-color: hsl(219, 100%, 30%);
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;
          }
        </style>
        <title>
        ${EJenniinaFi[(language as ELanguage) || 'en']}</title>
      </head>
      <body>
      <div>
        <h1>${EJenniinaFi[(language as ELanguage) || 'en']}
        </h1>
        <h2>${EPasswordReset[language as ELanguage] ?? 'Password Reset'}</h2>
        <form action="/api/users/reset/${token}?lang=${language}" method="post">
          <div>
            <label for="newPassword">${
              ENewPassword[language as ELanguage] ?? 'New password'
            }:</label>
            <input type="password" id="newPassword" name="newPassword" required>
          </div>
          <div>
            <label for="confirmPassword">${
              EConfirmPassword[language as ELanguage] ?? 'Confirm Password'
            }:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required>
          </div>
          <button type="submit">${
            EResetPassword[language as ELanguage] ?? 'Reset password'
          }</button>
        </form> 
      </div>
      </body>
    </html>
  `
      res.send(htmlResponse)
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Internal Server Error *' })
  }
}

const resetPasswordToken = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params
  const { newPassword, confirmPassword } = req.body
  const language = req.query.lang || 'en'

  enum EPasswordResetSuccessfully {
    en = 'Password reset successfully',
    es = 'Restablecimiento de contraseña exitoso',
    fr = 'Réinitialisation du mot de passe réussie',
    de = 'Passwort erfolgreich zurückgesetzt',
    pt = 'Redefinição de senha bem-sucedida',
    cs = 'Obnovení hesla bylo úspěšné',
    fi = 'Salasanan palautus onnistui',
  }
  enum EPasswordsDoNotMatch {
    en = 'Passwords do not match',
    es = 'Las contraseñas no coinciden',
    fr = 'Les mots de passe ne correspondent pas',
    de = 'Passwörter stimmen nicht überein',
    pt = 'As senhas não coincidem',
    cs = 'Hesla se neshodují',
    fi = 'Salasanat eivät täsmää',
  }

  try {
    // Validate the token
    const user = await User.findOne({ resetToken: token })
    if (!user) {
      res.status(400).json({ message: 'Invalid or expired token' })
    } else if (user) {
      // Check if newPassword and confirmPassword match
      if (newPassword !== confirmPassword) {
        // res.status(400).json({
        //   success: false,
        //   message:
        //     EPasswordsDoNotMatch[language as keyof typeof EPasswordsDoNotMatch] ||
        //     'Passwords do not match',
        // })
        const htmlResponse = `
    <html lang=${language}>
      <head>
      
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style> 
        @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Oswald:wght@500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
          body {
            font-family: Lato, Helvetica, Arial, sans-serif;
            background-color: hsl(219, 100%, 10%);
            color: white;
            letter-spacing: -0.03em;
            display:flex;
            justify-content:center;
            align-items:center;
            min-height: 100vh;
          }
          body > div {
            margin: 0 auto;
            max-width: 800px;  
          }
          h1 {
            font-family: Oswald, Lato, Helvetica, Arial, sans-serif;
            text-align: center;
          }
          p {
            font-size: 18px;
            text-align: center;
          }
          a {
            color: white;
          }
          form {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap:1.6rem;
          } 
          form > div {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap:0.6rem;
          }
          input {
            padding: 0.6rem;
            border-radius: 2rem;
            border: none;
            background-color: hsl(219, 100%, 20%);
            color: white;
            font-size: 1.2rem;
          }
          button {
            padding: 0.6rem;
            border-radius: 2rem;
            border: none;
            background-color: hsl(219, 100%, 30%);
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;
          }
        </style>
        <title>
        ${EJenniinaFi[(language as ELanguage) || 'en']}</title>
      </head>
      <body>
      <div>
        <h1>${EPasswordReset[language as ELanguage] ?? 'Password Reset'}</h1>
        <form action="/api/users/reset/${token}?lang=${language}" method="post">
        <label for="newPassword">${
          ENewPassword[language as ELanguage] ?? 'New password'
        }:</label>
        <input type="password" id="newPassword" name="newPassword" required>
        <label for="confirmPassword">${
          EConfirmPassword[language as ELanguage] ?? 'Confirm Password'
        }:</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required>
        <p>${EPasswordsDoNotMatch[language as ELanguage] ?? 'Passwords do not match!'}</p>
        <button type="submit">${
          EResetPassword[language as ELanguage] ?? 'Reset password'
        }</button>
      </form> 
      </div>
      </body>
    </html>
  `
        res.send(htmlResponse)
      } else {
        // Handle password update logic
        // ... (update the user's password in your database)
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
        // user.password = hashedPassword

        // // Clear the resetToken field in the database
        // user.resetToken = undefined
        // await user
        //   .save()
        const updatedUser = await User.findOneAndUpdate(
          { resetToken: token },
          { $set: { password: hashedPassword, resetToken: null } },
          { new: true }
        ).exec()
        if (updatedUser) {
          res.send(`
      <!DOCTYPE html>
      <html lang=${language}>
      <head>
      
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style> 
        @import url('https://fonts.googleapis.com/css2?family=Caveat&family=Oswald:wght@500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap');
          body {
            font-family: Lato, Helvetica, Arial, sans-serif;
            background-color: hsl(219, 100%, 10%);
            color: white;
            letter-spacing: -0.03em;
            display:flex;
            justify-content:center;
            align-items:center;
            min-height: 100vh;
          }
          body > div {
            margin: 0 auto;
            max-width: 800px;  
          }
          h1 {
            font-family: Oswald, Lato, Helvetica, Arial, sans-serif;
            text-align: center;
          }
          p {
            font-size: 18px;
            text-align: center;
          }
          a {
            color: white;
          }
        </style>
        <title>
        ${EJenniinaFi[(language as ELanguage) || 'en']}</title>
      </head>
      <body>
      <div>
        <h1>${
          EPasswordResetSuccessfully[
            language as keyof typeof EPasswordResetSuccessfully
          ] || 'Password reset successfully'
        }</h1>
        <p>
        <a href=${process.env.SITE_URL}/?login=login>${
            EBackToTheApp[language as ELanguage] ?? 'Back to the app'
          }</a>
        </p>
      </div>
      </body>
    </html>
    `)
        } else {
          res.status(500).json({ success: false, message: 'Internal Server Error *¤' })
        }
      }
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Internal Server Error ¤' })
  }
}

const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Password changed' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const changePasswordToken = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Password changed with token' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Email verified' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const changeEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Email changed' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const changeEmailToken = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Email changed with token' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const verifyUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Username verified' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const verifyUsernameToken = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Username verified with token' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const forgotUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Username forgot' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const resetUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Username reset' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const resetUsernameToken = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Username reset with token' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const changeUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Username changed' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const changeUsernameToken = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ message: 'Username changed with token' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: EError[(req.body.language as ELanguage) || 'en'] })
  }
}

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    await Todo.deleteMany({ user: id })

    await Quiz.deleteMany({ user: id })

    await Joke.updateMany({ users: id }, { $pull: { users: id } })

    await User.deleteOne({ _id: id })

    res.status(200).json({
      success: true,
      message: EUserDeleted[(req.body?.language as unknown as ELanguage) || 'en'],
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: EError[(req.body?.language as ELanguage) || 'en'],
    })
  }
}
export {
  // verificationSuccess,
  checkIfAdmin,
  authenticateUser,
  getUsers,
  getUser,
  addUser,
  confirmEmail,
  updateUsername,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  resetPasswordToken,
  changePassword,
  changePasswordToken,
  verifyEmail,
  verifyEmailToken,
  changeEmail,
  changeEmailToken,
  verifyUsername,
  verifyUsernameToken,
  forgotUsername,
  resetUsername,
  resetUsernameToken,
  changeUsername,
  changeUsernameToken,
  generateToken,
  verifyTokenMiddleware,
  verifyToken,
  findUserByUsername,
  requestNewToken,
  refreshExpiredToken,
  comparePassword,
}
