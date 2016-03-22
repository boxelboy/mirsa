<?php
/**
 * BusinessMan plugin for AfterLogic Webmail Pro
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 */
class_exists('CApi') or die();

class CBusinessMan extends AApiPlugin
{
    /**
     * @var \AppKernel
     */
    private $_symfonyKernel;

    /**
     * {@inheritDoc}
     */
    public function __construct(CApiPluginManager $pluginManager)
    {
        parent::__construct('1.0', $pluginManager);
    }

    /**
     * {@inheritDoc}
     */
    public function Init()
    {
        parent::Init();

        // Load UI files
        $this->AddJsFile('js/libs/jquery.easyModal.js');
        $this->AddJsFile('js/import.js');
        $this->AddJsFile('js/businessman.js');

        // Register AJAX hooks
        $this->AddJsonHook('AjaxBusinessMan_GetUser', 'getUser');
        $this->AddJsonHook('AjaxBusinessMan_GetSearchResults', 'findEntities');
        $this->AddJsonHook('AjaxBusinessMan_FindEmail', 'findEmail');
        $this->AddJsonHook('AjaxBusinessMan_SaveEmail', 'saveEmail');

        // Register plugin hooks
        $this->AddHook('webmail.build-message-for-send', 'onSendMessage');
    }

    /**
     * Save sent emails to BusinessMan
     *
     * @param \MailSo\Mime\Message $message           Message to be sent
     * @param bool                 $postToBusinessman Post message to BusinessMan
     *
     * @return null
     */
    public function onSendMessage(\MailSo\Mime\Message $message, $postToBusinessman, $text)
    {
        if ($postToBusinessman || $postToBusinessman === 'true') {
            // Get Symfony services
            $em = $this->getServiceContainer()->get('doctrine')->getManager();
            $user = $this->getSymfonyUser();

            // Create new email record
            $email = new \BusinessMan\Bundle\WebmailBundle\Entity\EmailMessage();

            $email->setStaff($user->getStaff());
            $email->setMessageBody($text);
            $email->setSubject($message->GetHeaderValue(\MailSo\Mime\Enumerations\Header::SUBJECT));
            $email->setTo($message->GetRcpt()->ToString());
            $email->setFromName($message->GetFrom()->GetDisplayName());
            $email->setFromEmail($message->GetFrom()->GetEmail());
            $email->setMessageId($message->MessageId());
            $email->setReceived(new \DateTime());
            $email->setInbound(false);
            $email->setSentOrReceived(true);

            $em->persist($email);
            $em->flush();
        }
    }

    /**
     * Get the logged in portal user
     *
     * @param \ProjectSeven\Actions $action Request data
     *
     * @return array
     */
    public function getUser(\ProjectSeven\Actions $action)
    {
        $serializer = $this->getServiceContainer()->get('jms_serializer');

        return json_decode($serializer->serialize($this->getSymfonyUser(), 'json'), true);
    }

    /**
     * Find business entities to attach an email
     *
     * @param \ProjectSeven\Actions $action Request data
     *
     * @return array
     */
    public function findEntities(\ProjectSeven\Actions $action)
    {
        // Validate data
        $data = $action->getParamValue('Data', array());

        if (!isset($data['entity']) || !isset($data['searchFilter'])) {
            return false;
        }

        // Get Symfony services
        $serializer = $this->getServiceContainer()->get('jms_serializer');
        $doctrine = $this->getServiceContainer()->get('doctrine');

        // Get results from Filemaker
        $filter = '%' . strtolower($data['searchFilter']) . '%';


        if ($data['entity'] == 'client') {
            $results = $doctrine->getRepository('BusinessManClientBundle:Client')
                ->createQueryBuilder('c')
                ->where('LOWER(c.name) LIKE :name')
                ->setParameter('name', $filter)
                ->getQuery()
                ->getResult();
        } else if ($data['entity'] == 'contact') {
            $qb = $doctrine->getRepository('BusinessManClientBundle:ClientContact')->createQueryBuilder('c');

            $qb->where(
                $qb->expr()->orX(
                    $qb->expr()->like('LOWER(c.forename)', ':forename'),
                    $qb->expr()->like('LOWER(c.surname)', ':surname'),
                    $qb->expr()->like('LOWER(c.email)', ':email')
                )
            );

            $qb->setParameter('forename', $filter);
            $qb->setParameter('surname', $filter);
            $qb->setParameter('email', $filter);

            $results = $qb->getQuery()->getResult();
        } else {
            return false;
        }

        // Serialize and return
        return array(
            'entity' => $data['entity'],
            'results' => json_decode($serializer->serialize($results, 'json'), true)
        );
    }

    /**
     * Find a message from BusinessMan
     *
     * @param \ProjectSeven\Actions $action Request data
     *
     * @return array
     */
    public function findEmail(\ProjectSeven\Actions $action)
    {
        // Validate data
        $data = $action->getParamValue('Data', array());

        if (!isset($data['messageId'])) {
            return false;
        }

        // Get Symfony services
        $serializer = $this->getServiceContainer()->get('jms_serializer');
        $doctrine = $this->getServiceContainer()->get('doctrine');

        // Find the email
        $email = $doctrine->getRepository('BusinessManWebmailBundle:EmailMessage')->findOneByMessageId($data['messageId']);

        // Build the response
        $response = array('Result' => $email !== null);

        if ($email) {
            $response['EmailMessage'] = json_decode($serializer->serialize($email, 'json'), true);
        }

        return $response;
    }

    /**
     * Save the email to BusinessMan
     *
     * @param \ProjectSeven\Actions $action Request data
     *
     * @return array
     */
    public function saveEmail(\ProjectSeven\Actions $action)
    {
        // Validate data
        $data = $action->getParamValue('Data', array());

        if (!isset($data['entity']) || !isset($data['id']) || !isset($data['email'])) {
            return false;
        }

        // Get Symfony services
        $doctrine = $this->getServiceContainer()->get('doctrine');
        $user = $this->getSymfonyUser();

        // Create new email record
        $email = new \BusinessMan\Bundle\WebmailBundle\Entity\EmailMessage();

        $email->setStaff($user->getStaff());
        $email->setMessageBody($data['email']['message']);
        $email->setSubject($data['email']['subject']);
        $email->setTo($data['email']['to']);
        $email->setFromName($data['email']['fromName']);
        $email->setFromEmail($data['email']['fromEmail']);
        $email->setCc($data['email']['cc']);
        $email->setBcc($data['email']['bcc']);
        $email->setMessageId($data['email']['messageId']);
        $email->setReceived(new \DateTime($data['email']['received']));
        $email->setInbound(true);
        $email->setSentOrReceived(true);

        if ($data['entity'] == 'client') {
            $client = $doctrine->getRepository('BusinessManClientBundle:Client')->findOneById($data['id']);
            $email->setClient($client);
        } else if ($data['entity'] == 'contact') {
            $contact = $doctrine->getRepository('BusinessManClientBundle:ClientContact')->findOneById($data['id']);
            $email->setContact($contact);
        }

        $em = $doctrine->getManager();

        $em->persist($email);
        $em->flush();

        return array('Result' => true);
    }

    /**
     * Get the currently logged in Symfony user
     *
     * @return \BusinessMan\Bundle\BusinessManBundle\Entity\User
     */
    protected function getSymfonyUser()
    {
        if (is_null($token = $this->getServiceContainer()->get('security.context')->getToken())) {
            throw new \Symfony\Component\Security\Core\Exception\AuthenticationException('Not logged in to portal account');
        }

        return $token->getUser();
    }

    /**
     * Bootstrap Symfony and return the service container
     *
     * @return \Symfony\Component\DependencyInjection\ContainerInterface
     */
    protected function getServiceContainer()
    {
        // Bootstrap Symfony if not already available
        if (!interface_exists('symfony\component\dependencyinjection\containerawareinterface')) {
            require_once __DIR__ . '/../../../../../../app/bootstrap.php.cache';
            require_once __DIR__ . '/../../../../../../app/AppKernel.php';
        }

        // Boot the kernel
        if (!($this->_symfonyKernel instanceof AppKernel)) {
            $env = CApi::GetConf('plugins.businessman.symfony.environment', 'prod');

            $this->_symfonyKernel = new AppKernel($env, true);
            $this->_symfonyKernel->loadClassCache();

            $request = \Symfony\Component\HttpFoundation\Request::createFromGlobals();
            $request->request->set('_route', 'BusinessManFileMakerBridgeBundle_email_internal');

            $this->_symfonyKernel->handle($request);
        }

        return $this->_symfonyKernel->getContainer();
    }
}

return new CBusinessMan($this);
