<?php
namespace BusinessMan\Bundle\SupportBundle\Controller;

use BusinessMan\Bundle\SupportBundle\Entity\SupportCall;
use BusinessMan\Bundle\SupportBundle\Entity\SupportCallMessage;
use BusinessMan\Bundle\SupportBundle\Event\AssignEvent;
use BusinessMan\Bundle\SupportBundle\Event\CloseEvent;
use BusinessMan\Bundle\SupportBundle\Event\ReopenEvent;
use BusinessMan\Bundle\SupportBundle\Event\ReplyEvent;
use BusinessMan\Bundle\SupportBundle\Form\Type\Reply\SupportCallMessageType as ReplyType;
use BusinessMan\Bundle\SupportBundle\Form\Type\Assign\SupportCallMessageType as AssignType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;

/**
 * SupportCallController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
 */
class SupportCallController extends Controller
{
    /**
     * List tickets belonging to the logged in user
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listOwnAction()
    {
        return $this->render('@BusinessManSupport/SupportCall/listOwn.html.twig');
    }

    /**
     * List open tickets
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listOpenAction()
    {
        return $this->render('@BusinessManSupport/SupportCall/listOpen.html.twig');
    }

    /**
     * List closed tickets
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400)
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listClosedAction()
    {
        return $this->render('@BusinessManSupport/SupportCall/listClosed.html.twig');
    }

    /**
     * View a ticket's details
     *
     * @param SupportCall $supportCall
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(SupportCall $supportCall)
    {
        return $this->render('@BusinessManSupport/SupportCall/view.html.twig', array('supportCall' => $supportCall));
    }

    /**
     * Reply to a ticket
     *
     * @param SupportCall $supportCall
     * @param Request     $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function replyAction(SupportCall $supportCall, Request $request)
    {
        if (!in_array($supportCall->getStatus(), array('New', 'Open'))) {
            throw $this->createNotFoundException('Support call is closed');
        }

        $reply = new SupportCallMessage();

        $reply->setSupportCall($supportCall);
        $reply->setStaff($this->getUser()->getStaff());
        $reply->setCreatedBy($this->getUser()->getUsername());
        $reply->setIpAddress($request->getClientIp());

        $form = $this->createForm(new ReplyType(), $reply);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $this->get('event_dispatcher')->dispatch(
                ReplyEvent::EVENT, new ReplyEvent($reply, $this->getUser())
            );

            $em = $this->getDoctrine()->getManager();
            $em->persist($reply);
            $em->flush();

            return $this->redirect(
                $this->generateUrl('support_calls_view', array('supportCall' => $supportCall->getId()))
            );
        }

        return $this->render(
            '@BusinessManSupport/SupportCall/reply.html.twig',
            array('supportCall' => $supportCall, 'form' => $form->createView())
        );
    }

    /**
     * Assign a ticket
     *
     * @param SupportCall $supportCall
     * @param Request     $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function assignAction(SupportCall $supportCall, Request $request)
    {
        if (!in_array($supportCall->getStatus(), array('New', 'Open'))) {
            throw $this->createNotFoundException('Support call is closed');
        }

        $message = new SupportCallMessage();

        $message->setSupportCall($supportCall);
        $message->setInternal(true);
        $message->setEmailClient(false);
        $message->setIpAddress($request->getClientIp());
        $message->setCreatedBy('BusinessMan');

        $form = $this->createForm(new AssignType(), $message);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $message->setInternal(true);
            $message->setEmailClient(false);

            $description = $message->getDescription();

            $message->setDescription(
                sprintf(
                    'This ticket has been assigned to %s by %s',
                    $supportCall->getAssignedTo()->getDisplayName(),
                    $this->getUser()->getStaff()->getDisplayName()
                )
            );

            $em = $this->getDoctrine()->getManager();
            $em->persist($message);

            $reply = new SupportCallMessage();

            $reply->setSupportCall($supportCall);
            $reply->setInternal(true);
            $reply->setEmailClient(false);
            $reply->setIpAddress($request->getClientIp());
            $reply->setStaff($this->getUser()->getStaff());

            if ($description) {
                $reply->setDescription($description);

                $em->persist($reply);
            }

            $this->get('event_dispatcher')->dispatch(
                AssignEvent::EVENT, new AssignEvent($reply, $this->getUser())
            );

            $em->flush();

            return $this->redirect(
                $this->generateUrl('support_calls_view', array('supportCall' => $supportCall->getId()))
            );
        }

        return $this->render(
            '@BusinessManSupport/SupportCall/assign.html.twig',
            array('form' => $form->createView(), 'supportCall' => $supportCall)
        );
    }

    /**
     * Reopen a ticket
     *
     * @param SupportCall $supportCall
     * @param Request     $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function reopenAction(SupportCall $supportCall, Request $request)
    {
        if (!in_array($supportCall->getStatus(), array('Cancelled', 'Closed', 'Complete'))) {
            throw $this->createNotFoundException('Support call is not closed');
        }

        $em = $this->getDoctrine()->getManager();

        $supportCall->setStatus('Open');

        $message = new SupportCallMessage();
        $message->setIpAddress($request->getClientIp());
        $message->setCreatedBy('BusinessMan');
        $message->setSupportCall($supportCall);
        $message->setInternal(true);
        $message->setDescription(
            sprintf('This ticket has been reopened by %s', $this->getUser()->getStaff()->getDisplayName())
        );

        $this->get('event_dispatcher')->dispatch(
            ReopenEvent::EVENT, new ReopenEvent($message, $this->getUser())
        );

        $em->persist($message);
        $em->flush();

        return $this->redirect($this->generateUrl('support_calls_view', array('supportCall' => $supportCall->getId())));
    }

    /**
     * Close a ticket
     *
     * @param SupportCall $supportCall
     * @param Request     $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function closeAction(SupportCall $supportCall, Request $request)
    {
        if (!in_array($supportCall->getStatus(), array('New', 'Open'))) {
            throw $this->createNotFoundException('Support call is closed');
        }

        $em = $this->getDoctrine()->getManager();

        $supportCall->setStatus('Closed');

        $message = new SupportCallMessage();
        $message->setIpAddress($request->getClientIp());
        $message->setCreatedBy('BusinessMan');
        $message->setSupportCall($supportCall);
        $message->setInternal(true);
        $message->setDescription(
            sprintf('This ticket has been closed by %s', $this->getUser()->getStaff()->getDisplayName())
        );

        $this->get('event_dispatcher')->dispatch(
            CloseEvent::EVENT, new CloseEvent($message, $this->getUser())
        );

        $em->persist($message);
        $em->flush();

        return $this->redirect($this->generateUrl('support_calls_view', array('supportCall' => $supportCall->getId())));
    }
}
