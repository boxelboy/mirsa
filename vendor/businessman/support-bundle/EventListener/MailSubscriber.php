<?php
namespace BusinessMan\Bundle\SupportBundle\EventListener;

use BusinessMan\Bundle\SupportBundle\Event\SupportCallEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use BusinessMan\Bundle\SupportBundle\Event\AssignEvent;
use BusinessMan\Bundle\SupportBundle\Event\ReplyEvent;

/**
 * MailSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 */
class MailSubscriber implements EventSubscriberInterface
{
    /**
     * @var \Swift_Mailer
     */
    private $mailer;

    /**
     * @var \Twig_Environment
     */
    private $twig;

    /**
     * @var string
     */
    private $supportEmailAddress;

    /**
     * @param \Swift_Mailer     $mailer
     * @param \Twig_Environment $twig
     * @param string            $supportEmailAddress
     */
    public function __construct(\Swift_Mailer $mailer, \Twig_Environment $twig, $supportEmailAddress)
    {
        $this->mailer = $mailer;
        $this->twig = $twig;
        $this->supportEmailAddress = $supportEmailAddress;
    }

    /**
     * {@inheritDoc}
     */
    public static function getSubscribedEvents()
    {
        return array(
            AssignEvent::EVENT => array('onAssign', 0),
            ReplyEvent::EVENT => array('onReply', 0)
        );
    }

    public function onAssign(AssignEvent $event)
    {
        $this->sendEmail(
            $event->getSupportCallMessage()->getSupportCall()->getAssignedTo()->getEmail(),
            'A support ticket has been assigned to you',
            '@BusinessManSupport/Mail/Support/assigned.txt.twig',
            $event
        );

        if ($event->getSupportCallMessage()->getEmailSupport()) {
            $this->sendEmail(
                $this->supportEmailAddress,
                'A support ticket has been reassigned',
                '@BusinessManSupport/Mail/Support/reassigned.txt.twig',
                $event
            );
        }
    }

    public function onReply(ReplyEvent $event)
    {
        if ($event->getSupportCallMessage()->getEmailSupport()) {
            $this->sendEmail(
                $this->supportEmailAddress,
                'A staff member has updated a support ticket',
                '@BusinessManSupport/Mail/Support/replied.txt.twig',
                $event
            );
        }

        if ($event->getSupportCallMessage()->getEmailClient()) {
            $this->sendEmail(
                $event->getSupportCallMessage()->getSupportCall()->getUpdateEmails(),
                'Your support ticket has been updated',
                '@BusinessManSupport/Mail/Client/replied.txt.twig',
                $event
            );
        }
    }

    protected function sendEmail($to, $subject, $template, SupportCallEvent $event)
    {
        $mail = new \Swift_Message();

        $mail->setFrom(array($this->supportEmailAddress => 'BusinessMan'));
        $mail->setTo($to);
        $mail->setSubject(
            sprintf('%s [TicketID %s]', $subject, $event->getSupportCallMessage()->getSupportCall()->getId())
        );
        $mail->setBody(
            $this->twig->render(
                $template,
                array('item' => $event->getSupportCallMessage(), 'user' => $event->getUser())
            )
        );

        return $this->mailer->send($mail);
    }
}
