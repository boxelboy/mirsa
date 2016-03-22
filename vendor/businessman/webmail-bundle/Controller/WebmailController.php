<?php
namespace BusinessMan\Bundle\WebmailBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

/**
 * WebmailController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/WebmailBundle
 */
class WebmailController extends Controller
{
    /**
     * Log in and show inbox
     *
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function inboxAction(Request $request, $bridge = false)
    {
        $base = $request->getScheme() . '://' . $request->getHost() . ($request->getPort() != 80 ? ':' . $request->getPort() : '') . $request->getBasePath();
        $url = $base . '/assets/webmail/index.php';

        $this->get('webmail.bridge')->login($this->getUser());

        return $this->render(
            '@BusinessManWebmail/Webmail/frame.html.twig',
            array('url' => $url, 'bridge' => $bridge)
        );
    }

    /**
     * Log in and compose new message
     *
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function composeAction(Request $request, $bridge = false)
    {
        $base = $request->getScheme() . '://' . $request->getHttpHost() . $request->getBasePath();
        $url = $base . '/assets/webmail/index.php#single-compose';

        if ($request->query->has('to')) {
            $url .= '/to/' . $request->query->get('to');
        }

        $attachments = array();

        if ($request->query->has('attachment')) {
            foreach ($request->query->get('attachment') as $attachment) {
                $attachments[] = $attachment;
            }
        }

        $this->get('webmail.bridge')->login($this->getUser());

        return $this->render(
            '@BusinessManWebmail/Webmail/frame.html.twig',
            array('url' => $url, 'bridge' => $bridge, 'attachments' => $attachments)
        );
    }
}
